import { getOrCreateVisitorId } from "@/features/visitor-alert/visitorIdentity";

function getDeviceInfo() {
    const ua = navigator.userAgent;

    let browser = "Unknown";
    if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua)
        ? "mobile"
        : "desktop";

    return { browser, os, deviceType };
}

export function startVisitorSessionTracking({
    endpoint,
    identity = "Guest",
    idleMs = 5 * 60 * 1000,
}) {
    if (window.__visitorSessionTrackerStarted) return;
    window.__visitorSessionTrackerStarted = true;

    const visitorId = getOrCreateVisitorId();

    const session = {
        visitorId,
        identity,
        device: getDeviceInfo(),
        startedAt: new Date().toLocaleString(),
        startedAtMs: Date.now(),
        routes: [],
        locationStack: [],
    };

    let currentPath = window.location.pathname + window.location.search;
    let currentStartedAt = Date.now();
    let hasSent = false;
    let idleTimer = null;

    function pushLocation(path) {
        if (!path) return;

        const lastLocation = session.locationStack[session.locationStack.length - 1];

        if (lastLocation?.path === path) return;

        session.locationStack.push({
            path,
            enteredAt: new Date().toLocaleString(),
            enteredAtMs: Date.now(),
        });
    }

    function saveRoute(path, durationMs) {
        if (!path || durationMs < 1000) return;

        const existing = session.routes.find((route) => route.path === path);

        if (existing) {
            existing.durationMs += durationMs;
            existing.visits += 1;
        } else {
            session.routes.push({
                path,
                durationMs,
                visits: 1,
            });
        }
    }

    async function sendStartAlert() {
        const payload = {
            eventType: "session_start",
            visitorId,
            identity,
            device: session.device,
            path: currentPath,
            startedAt: session.startedAt,
        };

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(() => { });
    }

    pushLocation(currentPath);
    sendStartAlert();

    function trackRouteChange() {
        if (hasSent) return;

        const newPath = window.location.pathname + window.location.search;
        const now = Date.now();

        if (newPath !== currentPath) {
            const durationMs = now - currentStartedAt;

            saveRoute(currentPath, durationMs);

            fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventType: "route_change",
                    visitorId,
                    identity,
                    device: session.device,
                    fromPath: currentPath,
                    toPath: newPath,
                    durationMs,
                    timestamp: new Date().toLocaleString(),
                }),
            }).catch(() => { });

            currentPath = newPath;
            currentStartedAt = now;

            pushLocation(newPath);
        }

        resetIdleTimer();
    }

    function sendSummary(reason = "ended") {
        if (hasSent) return;
        hasSent = true;

        clearTimeout(idleTimer);

        const now = Date.now();
        saveRoute(currentPath, now - currentStartedAt);

        const payload = {
            ...session,
            eventType: "session_end",
            endedAt: new Date().toLocaleString(),
            durationMs: now - session.startedAtMs,
            reason,
        };

        const body = JSON.stringify(payload);

        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                endpoint,
                new Blob([body], { type: "application/json" })
            );
            return;
        }

        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
        }).catch(() => { });
    }

    function resetIdleTimer() {
        if (hasSent) return;

        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
            sendSummary("idle_5_minutes");
        }, idleMs);
    }

    ["click", "scroll", "keydown", "mousemove", "touchstart"].forEach(
        (eventName) => {
            window.addEventListener(eventName, resetIdleTimer, { passive: true });
        }
    );

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        trackRouteChange();
    };

    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        trackRouteChange();
    };

    window.addEventListener("popstate", trackRouteChange);

    window.addEventListener("pagehide", () => {
        sendSummary("page_closed");
    });

    resetIdleTimer();

    return function stopVisitorSessionTracking() {
        sendSummary("component_unmounted");

        window.__visitorSessionTrackerStarted = false;

        ["click", "scroll", "keydown", "mousemove", "touchstart"].forEach(
            (eventName) => {
                window.removeEventListener(eventName, resetIdleTimer);
            }
        );

        window.removeEventListener("popstate", trackRouteChange);

        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
    };
}