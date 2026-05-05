import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

// Comma-separated list in `.env` / Netlify env, e.g.:
// VITE_ADMIN_EMAILS=me@example.com,other@example.com
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export const useAuth = () => {
    // null = not logged in, undefined = still checking, object = logged in
    const [user, setUser] = useState(undefined);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);

            // Use .includes() to check if the current email is in your admin list
            if (u && u.email && ADMIN_EMAILS.includes(u.email.toLowerCase())) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsub();
    }, []);

    return { user, isAdmin, loading: user === undefined };
};
