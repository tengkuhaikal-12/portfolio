import { COLLECTIONS } from "@/shared/constants/collections";
import { ROUTES, toExperienceDetail, toProjectDetail } from "@/shared/constants/routes";

export const portfolioSectionConfigs = {
  experience: {
    key: "experience",
    number: "02",
    title: "Experience",
    collectionName: COLLECTIONS.experience,
    viewAllHref: ROUTES.experience,
    detailHref: toExperienceDetail,
  },
  projects: {
    key: "projects",
    number: "03",
    title: "Projects",
    collectionName: COLLECTIONS.projects,
    viewAllHref: ROUTES.projects,
    detailHref: toProjectDetail,
    dark: true,
  },
  education: {
    key: "education",
    number: "04",
    title: "Education",
    collectionName: COLLECTIONS.education,
    viewAllHref: ROUTES.education,
  },
};
