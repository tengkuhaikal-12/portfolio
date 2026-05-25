import { db } from "@/shared/services/firebase/client";
import { COLLECTIONS } from "@/shared/constants/collections";
import { getClientDeviceInfo, getOrCreateAnonymousVisitorId } from "@/shared/utils/clientMetadata";
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { normalizeTrafficLog } from "@/features/analytics/domain/trafficLogModel";

export async function logTrafficVisit({ pathname, search = "", user = null }) {
  try {
    const deviceInfo = getClientDeviceInfo();

    const payload = {
      createdAt: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
      route: `${pathname || "/"}${search || ""}`,
      path: pathname || "/",
      query: search || "",
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      deviceType: deviceInfo.deviceType,
      userAgent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      language: deviceInfo.language,
      timezone: deviceInfo.timezone,
      screen: deviceInfo.screen,
      referrer: deviceInfo.referrer,
      anonymousId: getOrCreateAnonymousVisitorId(),
      uid: user?.uid || null,
      email: user?.email || null,
      authProvider: user?.providerData?.[0]?.providerId || null,
      ipAddress: null,
      ipSource: "not-collected-client-side",
    };

    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== null && value !== undefined)
    );

    await addDoc(collection(db, COLLECTIONS.analyticsLogs), sanitizedPayload);
  } catch (error) {
    // Fail silently by design so tracking never breaks user flows.
    console.debug("Traffic logging skipped:", error?.code || error?.message || error);
  }
}

export async function fetchRecentTrafficLogs(maxRecords = 300) {
  const logsQuery = query(
    collection(db, COLLECTIONS.analyticsLogs),
    orderBy("createdAt", "desc"),
    limit(maxRecords)
  );

  const snapshot = await getDocs(logsQuery);
  return snapshot.docs.map((docEntry) => normalizeTrafficLog({ id: docEntry.id, ...docEntry.data() }));
}
