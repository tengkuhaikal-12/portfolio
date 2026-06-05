import { useEffect, useState } from "react";
import { fetchPortfolioOverview } from "@/features/dashboard/data/portfolioService";

export const usePortfolioOverview = () => {
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchPortfolioOverview();
        setProjects(data.projects);
        setExperience(data.experience);
        setEducation(data.education);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const removeEntry = (collectionName, id) => {
    if (collectionName === "projects") setProjects((prev) => prev.filter((item) => item.id !== id));
    if (collectionName === "experience") setExperience((prev) => prev.filter((item) => item.id !== id));
    if (collectionName === "education") setEducation((prev) => prev.filter((item) => item.id !== id));
  };

  const patchEntry = (collectionName, updatedItem) => {
    const patchItem = (prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item));

    if (collectionName === "projects") setProjects(patchItem);
    if (collectionName === "experience") setExperience(patchItem);
    if (collectionName === "education") setEducation(patchItem);
  };

  return {
    projects,
    experience,
    education,
    loading,
    removeEntry,
    patchEntry,
  };
};
