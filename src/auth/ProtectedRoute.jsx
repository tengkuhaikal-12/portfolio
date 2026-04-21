import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const ProtectedRoute = ({ children }) => {
    const { user, isAdmin } = useAuth();

    // ⏳ wait for Firebase
    if (user === undefined) {
        return <div>Loading...</div>;
    }

    // ❌ not logged in
    if (!user) {
        return <Navigate to="/" />;
    }

    // ❌ not admin
    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    // ✅ allow
    return children;
};

export default ProtectedRoute;