export const getItemMeta = (item, sectionKey) => {
  if (sectionKey === "projects" && Array.isArray(item.techStack) && item.techStack.length) {
    return item.techStack.join(" / ");
  }

  return item.subtitle || "";
};

export const getItemDetailHref = (item, config) => {
  if (!config.detailHref || !item?.id) return undefined;
  return config.detailHref(item.id);
};
