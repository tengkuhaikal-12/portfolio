import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/shared/services/firebase/client";
import { hasAdminClaim } from "@/features/auth/services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    const unsub = onIdTokenChanged(auth, async (nextUser) => {
      if (!alive) return;
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const admin = await hasAdminClaim(nextUser);
        if (alive) setIsAdmin(admin);
      } catch {
        if (alive) setIsAdmin(false);
      }
    });

    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return {
    user,
    isAdmin,
    loading: user === undefined,
  };
};
