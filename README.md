# Portfolio

## Visitor WhatsApp Alerts (whatsapp-web.js)

The site sends a first-visit WhatsApp alert from the backend Netlify Function at
`netlify/functions/visitor-alert.js`. The frontend only posts visitor metadata;
the WhatsApp send happens on the backend through `whatsapp-web.js`.

Default recipient: `+60105618065`. Admins can update the number from
`Portfolio Manager > Settings`. The value is stored in Firestore at
`appConfig/visitorAlerts.whatsappNumber` and loaded dynamically by the backend.

### Message Format

```text
New Website Visitor Alert

Time: [current time]
Day: [current day]
Identity: [email or Guest / Unknown User]
Device: [device type, browser, OS]
```

### Backend Environment

Required for dynamic settings:

```text
FIREBASE_SERVICE_ACCOUNT_JSON={"project_id":"...","client_email":"...","private_key":"..."}
```

Optional WhatsApp Web settings:

```text
WHATSAPP_ALERT_TO=+60105618065
WHATSAPP_SHOW_BROWSER=false
WHATSAPP_SESSION_PATH=.wwebjs_auth
WHATSAPP_SEND_TIMEOUT_MS=180000
PUPPETEER_EXECUTABLE_PATH=C:\path\to\chrome.exe
```

`WHATSAPP_SESSION_PATH` stores the WhatsApp Web login locally. The default
`.wwebjs_auth/` folder is ignored by Git. Delete that folder only when you
intentionally need to reset the linked-device session.

### QR Authentication

1. Install dependencies with `npm install`.
2. Run the Netlify function locally with `npx netlify dev`.
3. Trigger the first visitor alert by opening the site or posting to
   `/.netlify/functions/visitor-alert`.
4. When the function prints a WhatsApp Web QR code in the terminal, scan it from WhatsApp:
   `Settings > Linked devices > Link a device`.
5. Keep `.wwebjs_auth/` in place locally. The backend reuses the saved session
   and keeps one warm WhatsApp Web browser/client instead of starting a new
   authentication flow for every request.

If the hosting environment clears the saved session files during a deploy or
cold start, scan the QR code again. Normal warm requests reuse the initialized
backend WhatsApp Web session.

This browser-based WhatsApp Web flow is intended for local development or an
always-on server with persistent disk. Netlify production functions do not
provide a reliable persistent browser/session environment; use the official
WhatsApp Cloud API or another hosted WhatsApp provider for production alerts.

### Duplicate Prevention

`useVisitorWhatsappAlert` stores `portfolio_visitor_alert_sent` in
`sessionStorage` with `localStorage` as a fallback. That prevents route changes
from sending extra alerts during the same visit. If sending fails, the website
continues loading and the error is logged client-side.
