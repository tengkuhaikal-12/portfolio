export const env = {
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT || "/.netlify/functions/contact",
  analyticsCollection: import.meta.env.VITE_ANALYTICS_COLLECTION || "trafficLogs",
  adminEmails: (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
};
