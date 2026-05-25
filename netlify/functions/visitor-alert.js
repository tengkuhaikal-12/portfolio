import { getAdminFirestore } from "./_shared/firebaseAdmin.js";

const APP_CONFIG_COLLECTION = "appConfig";
const VISITOR_ALERT_DOC_ID = "visitorAlerts";

const json = (statusCode, payload, headers = {}) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
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
    .map((v) => v.trim())
    .filter(Boolean);

const corsHeadersForOrigin = (origin) => {
  const allowed = parseAllowedOrigins();

  if (!origin) return { "Access-Control-Allow-Origin": "*", Vary: "Origin" };

  if (allowed.length === 0 || allowed.includes(origin)) {
    return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }

  return null;
};

const parseBody = (event) => {
  if (!event.body) return {};
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
};

function sanitizeString(value, maxLen = 256) {
  return String(value || "").trim().slice(0, maxLen);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function buildVisitorMessage(payload) {
  const now = new Date();

  const identity = sanitizeString(payload.identity, 320) || "Guest / Unknown User";

  const deviceType =
    sanitizeString(payload.device?.deviceType || payload.deviceType, 32) ||
    "unknown";

  const browser =
    sanitizeString(payload.device?.browser || payload.browser, 64) ||
    "Unknown";

  const os =
    sanitizeString(payload.device?.os || payload.os, 64) ||
    "Unknown";

  const startedAt = sanitizeString(payload.startedAt, 80) || "Unknown";
  const endedAt = sanitizeString(payload.endedAt, 80) || now.toLocaleString();
  const duration = formatDuration(payload.durationMs);

  const routes = Array.isArray(payload.routes) ? payload.routes : [];

  const routeText =
    routes.length > 0
      ? routes
        .slice(0, 15)
        .map((route, index) => {
          const path = sanitizeString(route.path, 120) || "Unknown route";
          const timeSpent = formatDuration(route.durationMs);
          const visits = Number(route.visits || 1);
          return `${index + 1}. ${path} — ${timeSpent} (${visits} visit${visits > 1 ? "s" : ""})`;
        })
        .join("\n")
      : "No route movement recorded";

  return [
    "📊 Website Visitor Session Summary",
    "",
    `👤 Identity: ${identity}`,
    `💻 Device: ${deviceType}`,
    `🌐 Browser: ${browser}`,
    `🖥 OS: ${os}`,
    "",
    `🟢 Started: ${startedAt}`,
    `🔴 Ended: ${endedAt}`,
    `⏱ Duration: ${duration}`,
    "",
    "🧭 Movement:",
    routeText,
  ].join("\n");
}

async function loadTelegramConfig() {
  const firestore = getAdminFirestore();

  let botToken = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  if (!firestore) return { botToken, chatId };

  try {
    const snapshot = await firestore
      .collection(APP_CONFIG_COLLECTION)
      .doc(VISITOR_ALERT_DOC_ID)
      .get();

    const data = snapshot.data() || {};

    botToken = data.telegramBotToken || botToken;
    chatId = data.telegramChatId || chatId;
  } catch {
    // ignore Firestore error
  }

  return { botToken, chatId };
}

async function sendTelegramAlert(messageText) {
  const { botToken, chatId } = await loadTelegramConfig();

  if (!botToken || !chatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram send failed: ${errorText}`);
  }
}

export const handler = async (event, context) => {
  if (context) context.callbackWaitsForEmptyEventLoop = false;

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

  try {
    const messageText = buildVisitorMessage(body);
    await sendTelegramAlert(messageText);

    return json(200, { ok: true, sent: true }, cors);
  } catch (error) {
    console.error("Telegram alert failed:", error?.message || error);

    return json(
      500,
      {
        error: "Failed to send Telegram alert",
        detail: error?.message || String(error),
      },
      cors
    );
  }
};