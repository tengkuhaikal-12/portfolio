import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";
import { isAdminEmail } from "@/features/auth/constants/adminEmails";

export async function loginWithGooglePopup() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const email = result?.user?.email?.toLowerCase() || "";

  if (!isAdminEmail(email)) {
    await signOut(auth);
    const err = new Error("Only the site owner is authorized to sign in.");
    err.code = "auth/not-admin";
    throw err;
  }

  return result;
}

export function logout() {
  return signOut(auth);
}
