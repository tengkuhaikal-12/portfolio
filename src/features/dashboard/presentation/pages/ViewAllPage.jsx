import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import Loading from "@/shared/components/Loading";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import EditPortfolioModal from "@/features/dashboard/presentation/components/EditPortfolioModal";
import Button from "@/features/dashboard/presentation/components/common/Button";
import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";
import PortfolioCard from "@/features/dashboard/presentation/components/cards/PortfolioCard";
import { useCollectionEntries } from "@/features/dashboard/presentation/hooks/useCollectionEntries";
import { usePortfolioAdminActions } from "@/features/dashboard/presentation/hooks/usePortfolioAdminActions";
import { getItemDetailHref, getItemMeta } from "@/features/dashboard/presentation/utils/cardHelpers";

const ViewAllPage = ({ config }) => {
  const { items, loading, removeEntry, patchEntry } = useCollectionEntries(config.collectionName);
  const { isAdmin } = useAuth();
  const adminActions = usePortfolioAdminActions({ removeEntry, patchEntry });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[#151513] selection:bg-[#ff5a36] selection:text-[#151513]">
      <Navbar />

      <ConfirmModal
        isOpen={adminActions.deleteConfirm.open}
        title="Delete entry?"
        message="This action cannot be undone."
        danger
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={adminActions.cancelDelete}
        onConfirm={adminActions.confirmDelete}
      />

      <main className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
        <Container>
          <SectionHeader
            number={config.number}
            title={config.title}
            action={<Button to="/" variant="paper">Back Home</Button>}
          />

          {items.length ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  meta={getItemMeta(item, config.key)}
                  linkTo={getItemDetailHref(item, config)}
                  thumbnailIndex={index}
                  isAdmin={isAdmin}
                  onEdit={() => adminActions.handleEdit(config.collectionName, item)}
                  onDelete={() => adminActions.handleDelete(config.collectionName, item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 border-2 border-[#151513] bg-[#fbf8f0] p-8 text-center shadow-[6px_6px_0_#151513]">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#151513]">No entries yet.</p>
            </div>
          )}
        </Container>
      </main>

      <EditPortfolioModal
        isOpen={adminActions.isModalOpen}
        onClose={adminActions.closeModal}
        data={adminActions.selectedItem}
        collectionName={adminActions.selectedCollection}
        onUpdateSuccess={adminActions.handleUpdateSuccess}
      />

      <Footer />
    </div>
  );
};

export default ViewAllPage;
