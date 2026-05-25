function getDeviceInfo() {
    const ua = navigator.userAgent;

    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    const deviceType = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";

    return { browser, os, deviceType };
}

export function startVisitorSessionTracking({ endpoint, identity = "Guest / Unknown User" }) {
    const startedAtDate = new Date();

    const session = {
        identity,
        device: getDeviceInfo(),
        startedAt: startedAtDate.toLocaleString(),
        startedAtMs: Date.now(),
        routes: [],
    };

    let currentPath = window.location.pathname + window.location.search;
    let currentStartedAt = Date.now();
    let hasSent = false;
    let idleTimer = null;

    function saveRoute(path, durationMs) {
        if (!path) return;

        const existing = session.routes.find((r) => r.path === path);

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
        const newPath = window.location.pathname + window.location.search;
        const now = Date.now();

        if (newPath !== currentPath) {
            saveRoute(currentPath, now - currentStartedAt);
            currentPath = newPath;
            currentStartedAt = now;
        }

        resetIdleTimer();
    }

    async function sendSummary(reason = "ended") {
        if (hasSent) return;
        hasSent = true;

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

        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
        });
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
            sendSummary("inactive");
        }, 2 * 60 * 1000);
    }

    ["click", "scroll", "keydown", "mousemove", "touchstart"].forEach((eventName) => {
        window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

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
    window.addEventListener("beforeunload", () => sendSummary("page_closed"));
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") sendSummary("tab_hidden");
    });

    resetIdleTimer();

    return {
        sendNow: sendSummary,
    };
}