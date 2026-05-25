import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";

export async function hasAdminClaim(user, forceRefresh = false) {
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult(forceRefresh);
  return tokenResult?.claims?.admin === true;
}

export async function loginWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const isAdmin = await hasAdminClaim(result.user, true);

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
