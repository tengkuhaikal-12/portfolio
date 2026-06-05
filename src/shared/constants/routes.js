export const ROUTES = {
  home: "/",
  admin: "/admin",
  adminAnalytics: "/admin/analytics",
  experience: "/experience",
  projects: "/projects",
  education: "/education",
  projectDetail: "/projects/:id",
  experienceDetail: "/experience/:id",
};

export const toProjectDetail = (id) => `/projects/${id}`;
export const toExperienceDetail = (id) => `/experience/${id}`;
