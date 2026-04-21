import { Routes, Route } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import Admin from "./admin/Admin";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Portfolio />} />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute> 
                }
            />

            {/* <Route path="/admin" element={<Admin />} /> */}
        </Routes>
    );
}

export default App;

