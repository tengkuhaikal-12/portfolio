import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";
import { env } from "@/shared/config/env";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function hasAdminAccess(user, forceRefresh = false) {
  if (!user) return false;

  const signedInEmail = normalizeEmail(user.email);
  const ownerEmail = normalizeEmail(env.ownerAdminEmail);

  if (!signedInEmail || !ownerEmail || signedInEmail !== ownerEmail) {
    return false;
  }

  // Ensure we evaluate the latest auth token metadata before allowing admin UI.
  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult?.claims?.email_verified === true || user.emailVerified === true;
  } catch {
    return user.emailVerified === true;
  }
}

export async function loginWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const isAdmin = await hasAdminAccess(result.user, true);

  if (!isAdmin) {
    await signOut(auth);
    const err = new Error("This account is authenticated but does not have admin access.");
    err.code = "auth/not-admin";
    throw err;
  }

  return result;
}

export function logout() {
  return signOut(auth);
}
