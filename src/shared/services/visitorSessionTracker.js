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

    const deviceType = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";

    return { browser, os, deviceType };
}

export function startVisitorSessionTracking({
    endpoint,
    identity = "Guest / Unknown User",
    idleMs = 5 * 60 * 1000,
}) {
    if (window.__visitorSessionTrackerStarted) return;
    window.__visitorSessionTrackerStarted = true;

    const session = {
        identity,
        device: getDeviceInfo(),
        startedAt: new Date().toLocaleString(),
        startedAtMs: Date.now(),
        routes: [],
    };

    let currentPath = window.location.pathname + window.location.search;
    let currentStartedAt = Date.now();
    let hasSent = false;
    let idleTimer = null;

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

    function trackRouteChange() {
        if (hasSent) return;

        const newPath = window.location.pathname + window.location.search;
        const now = Date.now();

        if (newPath !== currentPath) {
            saveRoute(currentPath, now - currentStartedAt);
            currentPath = newPath;
            currentStartedAt = now;
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
}