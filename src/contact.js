import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import nodemailer from 'nodemailer';
import { site } from './site.js';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Very small in-memory rate limit: 5 submissions per IP per 10 minutes.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

let transport;
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transport;
}

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

export function validate(body) {
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    company: clean(body.company, 160),
    type: clean(body.type, 80),
    budget: clean(body.budget, 80),
    message: clean(body.message, 5000),
  };
  const errors = {};
  if (!data.name) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.message.length < 10) errors.message = 'A sentence or two about the project helps us reply properly.';
  if (data.type && !site.projectTypes.includes(data.type)) data.type = '';
  if (data.budget && !site.budgets.includes(data.budget)) data.budget = '';
  return { data, errors };
}

async function deliver(data, ip) {
  const record = { ...data, ip, at: new Date().toISOString() };
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(path.join(dataDir, 'enquiries.jsonl'), JSON.stringify(record) + '\n');

  const t = getTransport();
  if (t) {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO || site.email,
      replyTo: `${data.name} <${data.email}>`,
      subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Company: ${data.company || '—'}`,
        `Project: ${data.type || '—'}`,
        `Budget: ${data.budget || '—'}`,
        '',
        data.message,
      ].join('\n'),
    });
  }
}

export const contactRouter = express.Router();

contactRouter.post(
  '/contact',
  express.urlencoded({ extended: false, limit: '20kb' }),
  express.json({ limit: '20kb' }),
  async (req, res) => {
    const wantsJson = req.is('application/json') || req.get('accept')?.includes('application/json');
    const body = req.body || {};

    // Honeypot: real people never fill this in.
    if (body.website) {
      return wantsJson ? res.json({ ok: true }) : res.redirect(303, '/?sent=1#contact');
    }

    if (rateLimited(req.ip)) {
      const msg = 'Too many messages — please email us directly instead.';
      return wantsJson ? res.status(429).json({ ok: false, message: msg }) : res.redirect(303, '/?sent=0#contact');
    }

    const { data, errors } = validate(body);
    if (Object.keys(errors).length) {
      if (wantsJson) return res.status(422).json({ ok: false, errors });
      return res.status(422).render('index', { status: 'invalid', errors, values: data });
    }

    try {
      await deliver(data, req.ip);
      return wantsJson ? res.json({ ok: true }) : res.redirect(303, '/?sent=1#contact');
    } catch (err) {
      console.error('Contact delivery failed:', err);
      const msg = `Something went wrong sending that. Please email ${site.email}.`;
      return wantsJson ? res.status(500).json({ ok: false, message: msg }) : res.redirect(303, '/?sent=0#contact');
    }
  },
);
