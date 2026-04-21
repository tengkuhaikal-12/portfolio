import { Routes, Route } from "react-router-dom";
import Portfolio from "./Portfolio";
import Admin from "./admin/Admin";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Portfolio />} />

            <Route
                path="/admin"
                element={<Admin />} />
        </Routes>
    );
}

export default App;