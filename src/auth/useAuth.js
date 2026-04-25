import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

// Use an array to store multiple authorized emails
const ADMIN_EMAILS = ["haikaltengku836@gmail.com", "diaryoftmhta@gmail.com"];

export const useAuth = () => {
    // null = not logged in, undefined = still checking, object = logged in
    const [user, setUser] = useState(undefined);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);

            // Use .includes() to check if the current email is in your admin list
            if (u && u.email && ADMIN_EMAILS.includes(u.email)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsub();
    }, []);

    return { user, isAdmin, loading: user === undefined };
};