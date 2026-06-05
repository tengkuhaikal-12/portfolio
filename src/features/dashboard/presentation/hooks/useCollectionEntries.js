import { useEffect, useState } from "react";
import { fetchCollectionEntries } from "@/features/dashboard/data/portfolioService";

export const useCollectionEntries = (collectionName) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        setItems(await fetchCollectionEntries(collectionName));
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [collectionName]);

  const removeEntry = (_, id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const patchEntry = (_, updatedItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)));
  };

  return {
    items,
    loading,
    removeEntry,
    patchEntry,
  };
};
