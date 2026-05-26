import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(value) {
  return String(value || "")
    .replace(/\\n/g, "\n")
    .trim();
}

function parseServiceAccountFromJson() {
  const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim();

  console.log("Firebase JSON env check:", {
    exists: Boolean(raw),
    length: raw.length,
    startsWith: raw.slice(0, 20),
  });

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      projectId: String(parsed.project_id || "").trim(),
      clientEmail: String(parsed.client_email || "").trim(),
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error.message);
    return null;
  }
}

function readServiceAccount() {
  const fromJson = parseServiceAccountFromJson();

  if (fromJson?.projectId && fromJson?.clientEmail && fromJson?.privateKey) {
    console.log("Firebase Admin using FIREBASE_SERVICE_ACCOUNT_JSON");
    return fromJson;
  }

  const projectId = String(
    process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ||
    process.env.VITE_FB_PROJECT_ID ||
    ""
  ).trim();

  const clientEmail = String(
    process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || ""
  ).trim();

  const privateKey = normalizePrivateKey(
    process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

  console.log("Firebase split env check:", {
    hasProjectId: Boolean(projectId),
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKey),
  });

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  console.log("Firebase Admin using split env variables");

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getOrInitAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = readServiceAccount();

  if (!serviceAccount) {
    console.error("Firebase Admin missing service account config");
    return null;
  }

  try {
    return initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
      }),
      projectId: serviceAccount.projectId,
    });
  } catch (error) {
    console.error("Firebase Admin initializeApp failed:", error.message);
    return null;
  }
}

export function getAdminFirestore() {
  const app = getOrInitAdminApp();

  if (!app) {
    return null;
  }

  return getFirestore(app);
}