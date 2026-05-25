import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";
import { db } from "@/shared/services/firebase/client";
import { COLLECTIONS } from "@/shared/constants/collections";
import { doc, getDoc } from "firebase/firestore";

export async function hasAdminClaim(user, forceRefresh = false) {
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult?.claims?.admin === true;
  } catch {
    return false;
  }
}

export async function hasAdminRoleDocument(user) {
  const uid = user?.uid;
  if (!uid) return false;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.adminUsers, uid));
    return snap.exists() && snap.data()?.active === true;
  } catch {
    return false;
  }
}

export async function hasAdminAccess(user, forceRefresh = false) {
  const hasClaim = await hasAdminClaim(user, forceRefresh);
  if (hasClaim) return true;
  return hasAdminRoleDocument(user);
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
