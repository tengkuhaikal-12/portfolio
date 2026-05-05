import { Routes, Route } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import Admin from "./admin/Admin";
import ProtectedRoute from "./auth/ProtectedRoute";
import ProjectDetail from "./pages/ProjectDetail";
import ExperienceDetail from "./pages/ExperienceDetail";
import ScrollToTop from "./component/ScrollToTop";

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Portfolio />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/experience/:id" element={<ExperienceDetail />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;

