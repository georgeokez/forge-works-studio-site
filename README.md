# Forgeworks Studio — website

Node + Express site built from the **Alloy** direction (version 2) on the Forgeworks Studio design canvas:
Instrument Serif + Geist (+ Geist Mono for labels), off-white ground, ink and burnt orange (`#c2410c`).

## Run it

```bash
npm install
npm run dev     # http://localhost:3000, restarts on file changes, reads .env if present
npm start       # production-style start
```

Requires Node 20+.

## Where things live

| Path | What it is |
| --- | --- |
| `src/site.js` | **All page copy** — services, principles, process, work, email, social links |
| `views/index.ejs` | Home page markup (sections in page order) |
| `views/partials/` | `<head>`, header/nav, footer |
| `public/css/styles.css` | Alloy styles, design tokens at the top under `:root` |
| `public/js/main.js` | Mobile menu, scroll reveals, scroll- and pointer-driven motion, AJAX contact form |
| `src/contact.js` | `POST /contact` — validation, honeypot, rate limit, delivery |

## Motion

Everything is vanilla CSS/JS — no animation libraries, so the CSP stays `'self'`-only.

- `.motion` on `<html>` (set by `main.js` unless the visitor prefers reduced motion) gates every
  "starts hidden" style. Without JS or with reduced motion, the page renders finished and still.
- Hooks are data attributes in the templates: `data-split` (word-by-word heading reveal),
  `data-stagger` (staggered children), `data-magnetic`, `data-spotlight`, `data-cursor="Label"`,
  `data-parallax`, plus one-offs for the hero emblem, marquee, goal text, principles and process.
- Pointer effects only run on mouse/trackpad devices.

## Contact form

Enquiries are always appended to `data/enquiries.jsonl`. To have them emailed as well, copy
`.env.example` to `.env` and fill in the `SMTP_*` settings and `CONTACT_TO`.

The form works without JavaScript (normal POST + redirect) and with it (no page reload).

## Still to fill in

Search `src/site.js` for `[` to find placeholders:

- Social links (currently `#`)
- Case-study link for The Bridge, plus more case studies
- Confirm the contact email and budget ranges

## Deploying

Any Node host works (Render, Railway, Fly.io, a VPS behind nginx). Set `NODE_ENV=production`,
`PORT`, `SITE_URL` and the SMTP variables. `GET /healthz` returns `{ "ok": true }` for health checks.
# forge-works-studio-site
