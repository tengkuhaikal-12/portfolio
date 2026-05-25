const MOBILE_REGEX = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
const TABLET_REGEX = /iPad|Tablet|PlayBook|Silk/i;

function detectOS(userAgent) {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}

function detectBrowser(userAgent) {
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  return "Unknown";
}

function detectDeviceType(userAgent) {
  if (TABLET_REGEX.test(userAgent)) return "tablet";
  if (MOBILE_REGEX.test(userAgent)) return "mobile";
  return "desktop";
}

export function getClientDeviceInfo() {
  const userAgent = navigator.userAgent || "";

  return {
    userAgent,
    os: detectOS(userAgent),
    browser: detectBrowser(userAgent),
    deviceType: detectDeviceType(userAgent),
    platform: navigator.platform || "unknown",
    language: navigator.language || "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    referrer: document.referrer || "",
  };
}

export function getOrCreateAnonymousVisitorId() {
  const key = "portfolio_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const value =
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  window.localStorage.setItem(key, value);
  return value;
}
