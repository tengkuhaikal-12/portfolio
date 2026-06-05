import ViewAllPage from "@/features/dashboard/presentation/pages/ViewAllPage";
import { portfolioSectionConfigs } from "@/features/dashboard/presentation/data/portfolioSections";

const ProjectsPage = () => <ViewAllPage config={portfolioSectionConfigs.projects} />;

export default ProjectsPage;
