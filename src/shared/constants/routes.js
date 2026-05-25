export const ROUTES = {
  home: "/",
  admin: "/admin",
  adminAnalytics: "/admin/analytics",
  projectDetail: "/projects/:id",
  experienceDetail: "/experience/:id",
};

export const toProjectDetail = (id) => `/projects/${id}`;
export const toExperienceDetail = (id) => `/experience/${id}`;
