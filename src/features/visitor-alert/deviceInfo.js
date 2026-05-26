export function getDeviceInfo() {
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

    return {
        deviceType,
        browser,
        os,
    };
}