import { useState } from "react";
import { deletePortfolioEntry } from "@/features/dashboard/data/portfolioService";

export const usePortfolioAdminActions = ({ removeEntry, patchEntry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, collectionName: "", id: "" });

  const handleEdit = (collectionName, item) => {
    setSelectedItem(item);
    setSelectedCollection(collectionName);
    setIsModalOpen(true);
  };

  const handleDelete = (collectionName, id) => {
    setDeleteConfirm({ open: true, collectionName, id });
  };

  const handleUpdateSuccess = (collectionName, updatedItem) => {
    patchEntry(collectionName, updatedItem);
  };

  const confirmDelete = async () => {
    const { collectionName, id } = deleteConfirm;
    setDeleteConfirm({ open: false, collectionName: "", id: "" });

    try {
      await deletePortfolioEntry(collectionName, id);
      removeEntry(collectionName, id);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return {
    isModalOpen,
    selectedItem,
    selectedCollection,
    deleteConfirm,
    closeModal: () => setIsModalOpen(false),
    cancelDelete: () => setDeleteConfirm({ open: false, collectionName: "", id: "" }),
    confirmDelete,
    handleEdit,
    handleDelete,
    handleUpdateSuccess,
  };
};
