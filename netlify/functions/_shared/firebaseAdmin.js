import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(value) {
  return String(value || "").replace(/\\n/g, "\n").trim();
}

function parseServiceAccountFromJson() {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      projectId: String(parsed.project_id || "").trim(),
      clientEmail: String(parsed.client_email || "").trim(),
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    return null;
  }
}

function readServiceAccount() {
  const fromJson = parseServiceAccountFromJson();
  if (fromJson?.projectId && fromJson?.clientEmail && fromJson?.privateKey) {
    return fromJson;
  }

  const projectId = String(process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID || process.env.VITE_FB_PROJECT_ID || "").trim();
  const clientEmail = String(process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || "").trim();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

function getOrInitAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) return null;

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey,
    }),
    projectId: serviceAccount.projectId,
  });
}

export function getAdminFirestore() {
  const app = getOrInitAdminApp();
  if (!app) return null;
  return getFirestore(app);
}
