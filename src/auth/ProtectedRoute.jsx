import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const ADMIN_EMAIL = "haikaltengku836@gmail.com";

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (user === undefined) {
        return <div>Loading...</div>; // IMPORTANT
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    if (user.email !== ADMIN_EMAIL) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;