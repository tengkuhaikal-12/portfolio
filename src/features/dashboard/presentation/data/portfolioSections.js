import { COLLECTIONS } from "@/shared/constants/collections";
import { ROUTES, toExperienceDetail, toProjectDetail } from "@/shared/constants/routes";

export const portfolioSectionConfigs = {
  experience: {
    key: "experience",
    number: "03",
    title: "Experience",
    collectionName: COLLECTIONS.experience,
    viewAllHref: ROUTES.experience,
    detailHref: toExperienceDetail,
    dark: true,
  },
  projects: {
    key: "projects",
    number: "04",
    title: "Projects",
    collectionName: COLLECTIONS.projects,
    viewAllHref: ROUTES.projects,
    detailHref: toProjectDetail,
    
  },
  education: {
    key: "education",
    number: "05",
    title: "Education",
    collectionName: COLLECTIONS.education,
    viewAllHref: ROUTES.education,
    dark: true,
  },
};
