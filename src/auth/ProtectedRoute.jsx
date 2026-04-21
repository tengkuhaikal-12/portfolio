import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";

const ProtectedAdmin = ({ children }) => {
    const { user, isAdmin } = useAuth();
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
            <div className="h-screen flex flex-col items-center justify-center text-white bg-black">
                <h1 className="text-2xl mb-2">🚫 Access Denied (Admin only)</h1>

                <p className="text-gray-400">
                    Redirecting to home in{" "}
                    <span className="text-white font-bold">{time}</span> s...
                </p>
            </div>
        );
    }

    return children;
};

export default ProtectedAdmin;