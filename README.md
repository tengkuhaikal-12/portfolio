# Portfolio

## Visitor WhatsApp Alerts (WBM)

The site sends a first-visit WhatsApp alert from the backend Netlify Function at
`netlify/functions/visitor-alert.js`. The frontend only posts visitor metadata;
the WhatsApp send happens on the backend through `wbm`.

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

Optional WBM settings:

```text
WHATSAPP_ALERT_TO=+60105618065
WBM_SESSION=true
WBM_SHOW_BROWSER=false
WBM_SEND_TIMEOUT_MS=90000
```

`WBM_SESSION` defaults to `true` so WBM can remember the WhatsApp Web session.
Use `WBM_SESSION=false` once only when you intentionally need to reset the saved
session.

### QR Authentication

1. Install dependencies with `npm install`.
2. Run the Netlify function locally with `npx netlify dev`.
3. Trigger the first visitor alert by opening the site or posting to
   `/.netlify/functions/visitor-alert`.
4. When WBM prints a WhatsApp Web QR code in the terminal, scan it from WhatsApp:
   `Settings > Linked devices > Link a device`.
5. Keep `WBM_SESSION=true` after authentication. WBM will reuse the saved session
   and the backend keeps one warm WBM browser/session instead of starting a new
   authentication flow for every request.

If the hosting environment clears WBM's saved session files during a deploy or
cold start, scan the QR code again. Normal warm requests reuse the initialized
backend WBM session.

### Duplicate Prevention

`useVisitorWhatsappAlert` stores `portfolio_visitor_alert_sent` in
`sessionStorage` with `localStorage` as a fallback. That prevents route changes
from sending extra alerts during the same visit. If sending fails, the website
continues loading and the error is logged client-side.
