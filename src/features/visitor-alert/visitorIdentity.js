export function getOrCreateVisitorId() {
    const storageKey = "portfolio_visitor_id";

    let visitorId = localStorage.getItem(storageKey);

    if (!visitorId) {
        visitorId = `visitor_${crypto.randomUUID()}`;
        localStorage.setItem(storageKey, visitorId);
    }

    return visitorId;
}