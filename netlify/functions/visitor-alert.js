import { getAdminFirestore } from "./_shared/firebaseAdmin.js";

const DEFAULT_WHATSAPP_NUMBER = "+60105618065";
const APP_CONFIG_COLLECTION = "appConfig";
const VISITOR_ALERT_DOC_ID = "visitorAlerts";
const E164_REGEX = /^\+[1-9]\d{7,14}$/;
const DEFAULT_WBM_SEND_TIMEOUT_MS = 90000;

let wbmStartPromise = null;
let wbmSendQueue = Promise.resolve();

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
    .map((value) => value.trim())
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

function normalizeWhatsappNumber(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function isValidWhatsappNumber(value) {
  return E164_REGEX.test(normalizeWhatsappNumber(value));
}

function sanitizeString(value, maxLen = 256) {
  return String(value || "").trim().slice(0, maxLen);
}

function positiveIntegerFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function toWbmPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "";
  return digits;
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function ensureWbmStdoutSupport() {
  const noop = () => {};
  if (typeof process.stdout.clearLine !== "function") {
    process.stdout.clearLine = noop;
  }
  if (typeof process.stdout.cursorTo !== "function") {
    process.stdout.cursorTo = noop;
  }
}

async function loadConfiguredWhatsappNumber() {
  const envNumber = normalizeWhatsappNumber(process.env.WHATSAPP_ALERT_TO || "");
  const fallbackNumber = isValidWhatsappNumber(envNumber) ? envNumber : DEFAULT_WHATSAPP_NUMBER;
  const firestore = getAdminFirestore();
  if (!firestore) return fallbackNumber;

  try {
    const snapshot = await firestore.collection(APP_CONFIG_COLLECTION).doc(VISITOR_ALERT_DOC_ID).get();
    const configured = normalizeWhatsappNumber(snapshot.data()?.whatsappNumber);
    return isValidWhatsappNumber(configured) ? configured : fallbackNumber;
  } catch {
    return fallbackNumber;
  }
}

function buildVisitorMessage(payload) {
  const now = new Date();

  const day = sanitizeString(payload.day, 40) || now.toLocaleDateString(undefined, { weekday: "long" });
  const time = sanitizeString(payload.time, 80) || now.toLocaleTimeString();
  const identity = sanitizeString(payload.identity, 320) || "Guest / Unknown User";

  const deviceType = sanitizeString(payload.device?.deviceType || payload.deviceType, 32) || "unknown";
  const browser = sanitizeString(payload.device?.browser || payload.browser, 64) || "Unknown";
  const os = sanitizeString(payload.device?.os || payload.os, 64) || "Unknown";

  return [
    "New Website Visitor Alert",
    "",
    `Time: ${time}`,
    `Day: ${day}`,
    `Identity: ${identity}`,
    `Device: ${deviceType}, ${browser}, ${os}`,
  ].join("\n");
}

async function importWbm() {
  ensureWbmStdoutSupport();

  const wbmModule = await import("wbm");
  const wbm = wbmModule?.default || wbmModule;

  if (!wbm?.start || !wbm?.sendTo) {
    throw new Error("WBM module did not expose the expected start/sendTo API.");
  }

  return wbm;
}

function getWbmStartOptions() {
  const showBrowser = process.env.WBM_SHOW_BROWSER === "true";
  const session = process.env.WBM_SESSION !== "false";

  return { showBrowser, session };
}

async function getStartedWbm() {
  if (!wbmStartPromise) {
    wbmStartPromise = (async () => {
      const wbm = await importWbm();
      await wbm.start(getWbmStartOptions());
      return wbm;
    })();

    wbmStartPromise.catch(() => {
      wbmStartPromise = null;
    });
  }

  return wbmStartPromise;
}

async function resetWbmSession() {
  const currentStart = wbmStartPromise;
  wbmStartPromise = null;

  if (!currentStart) return;

  try {
    const wbm = await currentStart;
    if (wbm?.end) {
      await wbm.end();
    }
  } catch {
    // Ignore cleanup errors; the next request will attempt a fresh start.
  }
}

function queueWbmSend(task) {
  const run = wbmSendQueue.then(task, task);
  wbmSendQueue = run.catch(() => {});
  return run;
}

async function sendWhatsappAlert({ toNumber, body }) {
  const recipient = toWbmPhoneNumber(toNumber);
  if (!recipient) {
    throw new Error("Configured WhatsApp number is invalid for WBM.");
  }

  const timeoutMs = positiveIntegerFromEnv("WBM_SEND_TIMEOUT_MS", DEFAULT_WBM_SEND_TIMEOUT_MS);

  return queueWbmSend(async () => {
    try {
      const wbm = await getStartedWbm();
      await withTimeout(wbm.sendTo(recipient, body), timeoutMs, "WBM WhatsApp send");
    } catch (error) {
      await resetWbmSession();
      throw error;
    }
  });
}

export const handler = async (event, context) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

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

  const messageText = buildVisitorMessage(body);

  try {
    const toNumber = await loadConfiguredWhatsappNumber();
    await sendWhatsappAlert({ toNumber, body: messageText });
    return json(200, { ok: true }, cors);
  } catch (error) {
    console.error("Visitor alert send failed:", error?.message || error);
    return json(500, { error: "Failed to send WhatsApp alert" }, cors);
  }
};
