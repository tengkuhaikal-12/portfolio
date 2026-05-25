import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { sendVisitorWhatsappAlert } from "@/features/alerts/data/visitorAlertService";
import { getClientDeviceInfo, getOrCreateAnonymousVisitorId } from "@/shared/utils/clientMetadata";

const VISITOR_ALERT_SENT_KEY = "portfolio_visitor_alert_sent";

function getWritableStorage() {
  if (typeof window === "undefined") return null;

  const storages = [window.sessionStorage, window.localStorage];
  for (const storage of storages) {
    try {
      const testKey = "__visitor_alert_storage_test__";
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return storage;
    } catch {
      // Keep trying the next storage.
    }
  }

  return null;
}

function hasAlreadySentAlert() {
  const storage = getWritableStorage();
  return storage?.getItem(VISITOR_ALERT_SENT_KEY) === "1";
}

function markAlertAsSent() {
  const storage = getWritableStorage();
  try {
    storage?.setItem(VISITOR_ALERT_SENT_KEY, "1");
  } catch {
    // Ignore storage failures so page behavior is never blocked.
  }
}

export function useVisitorWhatsappAlert() {
  const { user, loading } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (loading || startedRef.current || typeof window === "undefined") return;
    if (hasAlreadySentAlert()) {
      startedRef.current = true;
      return;
    }

    startedRef.current = true;
    markAlertAsSent();

    const now = new Date();
    const device = getClientDeviceInfo();
    const identity = user?.email || "Guest / Unknown User";

    const payload = {
      time: now.toLocaleTimeString(),
      day: now.toLocaleDateString(undefined, { weekday: "long" }),
      identity,
      device: {
        deviceType: device.deviceType || "unknown",
        browser: device.browser || "Unknown",
        os: device.os || "Unknown",
      },
      timezone: device.timezone || "unknown",
      route: `${window.location.pathname}${window.location.search || ""}`,
      anonymousId: getOrCreateAnonymousVisitorId(),
    };

    void sendVisitorWhatsappAlert(payload).catch((error) => {
      console.warn("Visitor WhatsApp alert failed:", error?.message || error);
    });
  }, [loading, user?.email]);
}
