import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { site } from './site.js';
import { contactRouter } from './contact.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function createApp() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  app.set('view engine', 'ejs');
  app.set('views', path.join(root, 'views'));
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'"],
          styleSrcAttr: ["'unsafe-inline'"],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: isProd ? [] : null,
        },
      },
    }),
  );
  app.use(compression());
  app.use(
    express.static(path.join(root, 'public'), {
      maxAge: isProd ? '7d' : 0,
    }),
  );

  app.locals.site = site;
  app.locals.year = new Date().getFullYear();
  app.locals.siteUrl = process.env.SITE_URL || '';

  app.get('/', (req, res) => {
    res.render('index', {
      status: req.query.sent === '1' ? 'sent' : req.query.sent === '0' ? 'error' : null,
    });
  });

  app.use(contactRouter);

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use((_req, res) => {
    res.status(404).render('404');
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).render('404', { error: true });
  });

  return app;
}
