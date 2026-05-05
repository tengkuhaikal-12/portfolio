import nodemailer from "nodemailer";

const json = (statusCode, payload, headers = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  },
  body: JSON.stringify(payload),
});

const getOrigin = (event) =>
  event.headers?.origin ||
  event.headers?.Origin ||
  event.headers?.referer ||
  event.headers?.Referer ||
  "";

const parseAllowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsHeadersForOrigin = (origin) => {
  const allowed = parseAllowedOrigins();

  if (!origin) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Vary": "Origin",
    };
  }

  if (allowed.length === 0 || allowed.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
    };
  }

  return null;
};

const parseBody = (event) => {
  if (!event.body) return {};
  try {
    return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body);
  } catch {
    return null;
  }
};

const makeTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const handler = async (event) => {
  const origin = getOrigin(event);
  const cors = corsHeadersForOrigin(origin);
  if (!cors) return json(403, { error: "CORS blocked" });

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        ...cors,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" }, cors);
  }

  const body = parseBody(event);
  if (!body) return json(400, { error: "Invalid JSON" }, cors);

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 4000);
  const website = String(body.website || "").trim().slice(0, 200); // honeypot

  if (website) return json(200, { ok: true }, cors); // pretend success
  if (!message || message.length < 10) return json(400, { error: "Message is too short" }, cors);

  const to = process.env.CONTACT_TO;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = makeTransporter();

  if (!to || !from || !transporter) {
    return json(500, { error: "Server not configured" }, cors);
  }

  const subject = `Portfolio contact${name ? ` — ${name}` : ""}`;
  const text = [`Name: ${name || "-"}`, `Email: ${email || "-"}`, "", message].join("\n");

  try {
    await transporter.sendMail({
      to,
      from,
      replyTo: email || undefined,
      subject,
      text,
    });
    return json(200, { ok: true }, cors);
  } catch {
    return json(500, { error: "Failed to send email" }, cors);
  }
};
