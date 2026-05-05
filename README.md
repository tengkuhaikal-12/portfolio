# my-portfolio

## Local dev

- App: `npm run dev`
- Netlify Functions + app together (recommended): `netlify dev`

## Contact form (Netlify Functions)

Flow: React (Vite) → Netlify Function → Nodemailer → Gmail inbox.

- Function: `netlify/functions/contact.js`
- Frontend endpoint default: `/.netlify/functions/contact`
- Optional alias: `/api/contact` via `netlify.toml`

### Environment variables

Set in Netlify (Site settings → Environment variables):

- `CONTACT_TO`
- `SMTP_USER`
- `SMTP_PASS` (Gmail App Password)
- `SMTP_FROM` (optional; defaults to `SMTP_USER`)
- `SMTP_HOST` / `SMTP_PORT` (optional; defaults to Gmail SMTP)
- `ALLOWED_ORIGINS` (optional; comma-separated allowlist)

For local dev, copy `.env.example` → `.env`. `netlify dev` will load it.

