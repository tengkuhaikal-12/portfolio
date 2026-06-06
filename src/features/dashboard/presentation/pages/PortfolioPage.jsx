import { useState } from "react";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import Loading from "@/shared/components/Loading";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import EditPortfolioModal from "@/features/dashboard/presentation/components/EditPortfolioModal";
import Hero from "@/features/dashboard/presentation/components/hero/Hero";
import AboutSection from "@/features/dashboard/presentation/components/about/AboutSection";
import SectionCarousel from "@/features/dashboard/presentation/components/carousel/SectionCarousel";
import ContactSection from "@/features/dashboard/presentation/components/contact/ContactSection";
import { usePortfolioOverview } from "@/features/dashboard/presentation/hooks/usePortfolioOverview";
import { usePortfolioAdminActions } from "@/features/dashboard/presentation/hooks/usePortfolioAdminActions";
import { portfolioSectionConfigs } from "@/features/dashboard/presentation/data/portfolioSections";
import { requestJson } from "@/shared/services/api/httpClient";
import { env } from "@/shared/config/env";

const PortfolioPage = () => {
  const { projects, experience, education, loading, removeEntry, patchEntry } = usePortfolioOverview();
  const { isAdmin } = useAuth();
  const adminActions = usePortfolioAdminActions({ removeEntry, patchEntry });
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "", website: "" });
  const [contactStatus, setContactStatus] = useState({ state: "idle", message: "" });

  const handleContactChange = (key) => (event) => {
    setContactForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactStatus({ state: "loading", message: "" });

    try {
      await requestJson(env.contactEndpoint, {
        method: "POST",
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          website: contactForm.website,
        }),
      });

      setContactForm({ name: "", email: "", message: "", website: "" });
      setContactStatus({ state: "success", message: "Message sent. I'll get back to you soon." });
    } catch (error) {
      setContactStatus({ state: "error", message: error?.message || "Something went wrong. Try again later." });
    }
  };

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

      <Hero />

      <main>
        <AboutSection />
        <SectionCarousel
          id="experience"
          config={portfolioSectionConfigs.experience}
          items={experience}
          isAdmin={isAdmin}
          onEdit={adminActions.handleEdit}
          onDelete={adminActions.handleDelete}
        />
        <SectionCarousel
          id="projects"
          config={portfolioSectionConfigs.projects}
          items={projects}
          isAdmin={isAdmin}
          onEdit={adminActions.handleEdit}
          onDelete={adminActions.handleDelete}
        />
        <SectionCarousel
          id="education"
          config={portfolioSectionConfigs.education}
          items={education}
          isAdmin={isAdmin}
          onEdit={adminActions.handleEdit}
          onDelete={adminActions.handleDelete}
        />
        <ContactSection
          contactForm={contactForm}
          contactStatus={contactStatus}
          onChange={handleContactChange}
          onSubmit={handleContactSubmit}
        />
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

export default PortfolioPage;
