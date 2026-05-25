import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/shared/services/firebase/client";
import { APP_CONFIG_DOCS, COLLECTIONS } from "@/shared/constants/collections";

const DEFAULT_WHATSAPP_NUMBER = "+60105618065";
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

function normalizeWhatsappNumber(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function resolveWhatsappNumber(value) {
  const normalized = normalizeWhatsappNumber(value);
  return E164_REGEX.test(normalized) ? normalized : DEFAULT_WHATSAPP_NUMBER;
}

export function isValidWhatsappNumber(value) {
  return E164_REGEX.test(normalizeWhatsappNumber(value));
}

export async function fetchVisitorAlertSettings() {
  const settingsRef = doc(db, COLLECTIONS.appConfig, APP_CONFIG_DOCS.visitorAlerts);
  const snapshot = await getDoc(settingsRef);

  if (!snapshot.exists()) {
    return {
      whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
      exists: false,
      updatedAt: null,
      updatedByEmail: null,
    };
  }

  const data = snapshot.data();
  return {
    whatsappNumber: resolveWhatsappNumber(data?.whatsappNumber),
    exists: true,
    updatedAt: data?.updatedAt || null,
    updatedByEmail: data?.updatedByEmail || null,
  };
}

export async function upsertVisitorAlertWhatsappNumber(rawWhatsappNumber) {
  const whatsappNumber = normalizeWhatsappNumber(rawWhatsappNumber);
  if (!isValidWhatsappNumber(whatsappNumber)) {
    throw new Error("Invalid number format. Use E.164 format like +60105618065.");
  }

  const currentUser = auth.currentUser;
  const settingsRef = doc(db, COLLECTIONS.appConfig, APP_CONFIG_DOCS.visitorAlerts);

  await setDoc(
    settingsRef,
    {
      whatsappNumber,
      updatedAt: serverTimestamp(),
      ...(currentUser?.uid ? { updatedByUid: currentUser.uid } : {}),
      ...(currentUser?.email ? { updatedByEmail: currentUser.email } : {}),
    },
    { merge: true }
  );

  return whatsappNumber;
}
