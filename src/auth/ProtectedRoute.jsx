import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";

const ProtectedAdmin = ({ children }) => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [time, setTime] = useState(5);

    useEffect(() => {
        if (!isAdmin) {
            const interval = setInterval(() => {
                setTime((t) => t - 1);
            }, 1000);

            const timer = setTimeout(() => {
                navigate("/");
            }, 5000);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [isAdmin, navigate]);

    if (!isAdmin) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-paper bg-ink">
                <h1 className="text-2xl mb-2">🚫 Access Denied (Admin only)</h1>

                <p className="text-paper/70">
                    Redirecting to home in{" "}
                    <span className="text-paper font-bold">{time}</span> s...
                </p>
            </div>
        );
    }

    return children;
};

export default ProtectedAdmin;
