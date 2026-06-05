import { Route, Routes } from "react-router-dom";
import ScrollToTop from "@/app/router/ScrollToTop";
import { ROUTES } from "@/shared/constants/routes";
import ProtectedRoute from "@/features/auth/presentation/components/ProtectedRoute";
import PortfolioPage from "@/features/dashboard/presentation/pages/PortfolioPage";
import ProjectDetailPage from "@/features/dashboard/presentation/pages/ProjectDetailPage";
import ExperienceDetailPage from "@/features/dashboard/presentation/pages/ExperienceDetailPage";
import ExperiencePage from "@/features/dashboard/presentation/pages/ExperiencePage";
import ProjectsPage from "@/features/dashboard/presentation/pages/ProjectsPage";
import EducationPage from "@/features/dashboard/presentation/pages/EducationPage";
import AdminPage from "@/features/admin/presentation/pages/AdminPage";
import AdminAnalyticsPage from "@/features/analytics/presentation/pages/AdminAnalyticsPage";

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.home} element={<PortfolioPage />} />
        <Route path={ROUTES.experience} element={<ExperiencePage />} />
        <Route path={ROUTES.projects} element={<ProjectsPage />} />
        <Route path={ROUTES.education} element={<EducationPage />} />
        <Route path={ROUTES.projectDetail} element={<ProjectDetailPage />} />
        <Route path={ROUTES.experienceDetail} element={<ExperienceDetailPage />} />

        <Route
          path={ROUTES.admin}
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.adminAnalytics}
          element={
            <ProtectedRoute>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default AppRouter;
