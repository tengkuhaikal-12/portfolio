import { getOrCreateVisitorId } from "./visitorIdentity";
import { getDeviceInfo } from "./deviceInfo";

const VISITOR_ALERT_ENDPOINT =
    import.meta.env.VITE_VISITOR_ALERT_ENDPOINT ||
    "/.netlify/functions/visitor-alert";

export async function sendVisitorAlert(payload) {
    try {
        const response = await fetch(VISITOR_ALERT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                visitorId: getOrCreateVisitorId(),
                device: getDeviceInfo(),
                ...payload,
            }),
        });

        return await response.json();
    } catch (error) {
        console.error("Visitor alert failed:", error);
        return null;
    }
}