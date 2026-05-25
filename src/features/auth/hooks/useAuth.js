import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";
import { isAdminEmail } from "@/features/auth/constants/adminEmails";

export const useAuth = () => {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAdmin(isAdminEmail(nextUser?.email));
    });

    return () => unsub();
  }, []);

  return {
    user,
    isAdmin,
    loading: user === undefined,
  };
};
