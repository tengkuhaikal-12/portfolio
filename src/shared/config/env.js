function buildDefaultFunctionEndpoint(functionName) {
  const slash =
    (typeof window !== "undefined" && typeof window.location?.pathname === "string"
      ? window.location.pathname.slice(0, 1)
      : "/") || "/";

  return ["", ".netlify", "functions", functionName].join(slash);
}

function normalizeEmailPart(value = "") {
  return String(value).trim().toLowerCase();
}

function buildOwnerAdminEmail() {
  const localPart = normalizeEmailPart(import.meta.env.VITE_ADMIN_EMAIL_LOCAL || "haikaltengku836");
  const domainPart = normalizeEmailPart(import.meta.env.VITE_ADMIN_EMAIL_DOMAIN || "gmail.com").replace(/^@+/, "");

  if (!localPart || !domainPart) return "";
  return `${localPart}@${domainPart}`;
}

export const env = {
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT || buildDefaultFunctionEndpoint("contact"),
  visitorAlertEndpoint: import.meta.env.VITE_VISITOR_ALERT_ENDPOINT || buildDefaultFunctionEndpoint("visitor-alert"),
  analyticsCollection: import.meta.env.VITE_ANALYTICS_COLLECTION || "trafficLogs",
  ownerAdminEmail: buildOwnerAdminEmail(),
};
