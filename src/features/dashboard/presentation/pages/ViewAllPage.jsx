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
    <div className="min-h-screen bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[var(--color-ink)] selection:bg-[var(--color-accent)] selection:text-[var(--color-ink)]">
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
            <div className="mt-10 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-8 text-center shadow-[6px_6px_0_var(--color-ink)]">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--color-ink)]">No entries yet.</p>
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
