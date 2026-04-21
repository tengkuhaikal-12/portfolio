import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const ADMIN_EMAIL = "haikaltengku836@gmail.com";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);

            if (u?.email === ADMIN_EMAIL) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });

        return () => unsub();
    }, []);

    return { user, isAdmin };
};