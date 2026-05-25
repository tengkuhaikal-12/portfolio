export function normalizeTrafficLog(entry) {
  return {
    id: entry.id,
    createdAt: entry.createdAt || null,
    clientTimestamp: entry.clientTimestamp || null,
    route: entry.route || "/",
    os: entry.os || "Unknown",
    browser: entry.browser || "Unknown",
    deviceType: entry.deviceType || "unknown",
    email: entry.email || null,
    uid: entry.uid || null,
    anonymousId: entry.anonymousId || null,
    language: entry.language || "unknown",
    timezone: entry.timezone || "unknown",
    platform: entry.platform || "unknown",
    screen: entry.screen || "",
    referrer: entry.referrer || "",
    ipAddress: entry.ipAddress || null,
  };
}
