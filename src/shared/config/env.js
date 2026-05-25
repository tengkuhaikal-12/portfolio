function buildDefaultContactEndpoint() {
  const slash =
    (typeof window !== "undefined" && typeof window.location?.pathname === "string"
      ? window.location.pathname.slice(0, 1)
      : "/") || "/";

  return ["", ".netlify", "functions", "contact"].join(slash);
}

export const env = {
  contactEndpoint: buildDefaultContactEndpoint(),
  analyticsCollection: import.meta.env.VITE_ANALYTICS_COLLECTION || "trafficLogs",
};
