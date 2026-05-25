import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoTrashOutline,
  IoPencilOutline,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLocationOutline,
} from "react-icons/io5";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import Loading from "@/shared/components/Loading";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import EditPortfolioModal from "@/features/dashboard/presentation/components/EditPortfolioModal";
import {
  deletePortfolioEntry,
  fetchPortfolioOverview,
} from "@/features/dashboard/data/portfolioService";
import { requestJson } from "@/shared/services/api/httpClient";
import { env } from "@/shared/config/env";
import { toExperienceDetail, toProjectDetail } from "@/shared/constants/routes";

const PortfolioPage = () => {
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, collectionName: "", id: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "", website: "" });
  const [contactStatus, setContactStatus] = useState({ state: "idle", message: "" });

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

  const handleDelete = (collectionName, id) => {
    setDeleteConfirm({ open: true, collectionName, id });
  };

  const performDelete = async (collectionName, id) => {
    try {
      await deletePortfolioEntry(collectionName, id);
      if (collectionName === "projects") setProjects((prev) => prev.filter((item) => item.id !== id));
      if (collectionName === "experience") setExperience((prev) => prev.filter((item) => item.id !== id));
      if (collectionName === "education") setEducation((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleEdit = (collectionName, item) => {
    setSelectedItem(item);
    setSelectedCollection(collectionName);
    setIsModalOpen(true);
  };

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

  const handleUpdateSuccess = (collectionName, updatedItem) => {
    const patchItem = (prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item));

    if (collectionName === "projects") setProjects(patchItem);
    if (collectionName === "experience") setExperience(patchItem);
    if (collectionName === "education") setEducation(patchItem);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Navbar />

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="Delete entry?"
        message="This action cannot be undone."
        danger
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteConfirm({ open: false, collectionName: "", id: "" })}
        onConfirm={async () => {
          const { collectionName, id } = deleteConfirm;
          setDeleteConfirm({ open: false, collectionName: "", id: "" });
          await performDelete(collectionName, id);
        }}
      />

      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28">
        <img
          src="/profile.jpg"
          alt="profile"
          className="w-32 h-32 md:w-40 md:h-40 object-cover shadow-md mb-6 border ui-border"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Tengku Haikal</h1>
        <p className="ui-muted mb-6 font-black tracking-widest">
          Universiti Malaya <br /> Bachelor of Computer Science (Software Engineering)
        </p>
        <p className="max-w-xl ui-muted">
          A curious developer who enjoys transforming ideas into real applications that people can use and benefit from.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-20">
        <section id="experience" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-text inline-block">Experience</h2>
          <div className="flex flex-col gap-6">
            {experience.map((exp) => (
              <ExperienceCard
                key={exp.id}
                id={exp.id}
                duration={exp.duration}
                title={exp.title}
                org={exp.subtitle}
                image={exp.image}
                desc={exp.description}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("experience", exp)}
                onDelete={() => handleDelete("experience", exp.id)}
              />
            ))}
          </div>
        </section>

        <section id="projects" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-text inline-block">Projects</h2>
          <div className="flex flex-col gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                id={proj.id}
                title={proj.title}
                tags={proj.techStack || []}
                desc={proj.description}
                image={proj.image}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("projects", proj)}
                onDelete={() => handleDelete("projects", proj.id)}
                role={proj.subtitle}
                duration={proj.duration}
              />
            ))}
          </div>
        </section>

        <section id="education" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-text inline-block">Education</h2>
          <div className="flex flex-col gap-6">
            {education.map((edu) => (
              <EducationCard
                key={edu.id}
                year={edu.duration}
                degree={edu.title}
                institution={edu.subtitle}
                desc={edu.description}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("education", edu)}
                onDelete={() => handleDelete("education", edu.id)}
              />
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-text inline-block">Contact</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ui-surface border ui-border shadow-md p-6">
              <p className="ui-muted text-sm mb-5">
                Want to collaborate or have a question? Send a message or reach me via the links below.
              </p>

              <div className="flex flex-col gap-3">
                <ContactRow
                  icon={<IoLogoLinkedin size={18} />}
                  label="LinkedIn"
                  value="linkedin.com"
                  href="https://www.linkedin.com/in/tengku-haikal-tengku-abdullah-651769291/"
                />
                <ContactRow
                  icon={<IoLogoGithub size={18} />}
                  label="GitHub"
                  value="github.com"
                  href="https://github.com/tengkuhaikal"
                />
                <ContactRow
                  icon={<IoLocationOutline size={18} />}
                  label="Location"
                  value="Kuala Lumpur, MY"
                />
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="ui-surface border ui-border shadow-md p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="hidden" aria-hidden="true">
                  <label className="text-sm font-black ui-muted">Website</label>
                  <input
                    value={contactForm.website}
                    onChange={handleContactChange("website")}
                    autoComplete="off"
                    tabIndex={-1}
                    className="w-full border ui-border bg-transparent px-4 py-2"
                    placeholder="https://"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black ui-muted">Name</label>
                  <input
                    value={contactForm.name}
                    onChange={handleContactChange("name")}
                    className="w-full border ui-border bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-text/20"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black ui-muted">Email</label>
                  <input
                    value={contactForm.email}
                    onChange={handleContactChange("email")}
                    className="w-full border ui-border bg-transparent px-4 py-2 focus:outline-none focus:ring-2 focus:ring-text/20"
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black ui-muted">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={handleContactChange("message")}
                    className="w-full min-h-[140px] border ui-border bg-transparent px-4 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-text/20"
                    placeholder="Tell me what you're building..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactStatus.state === "loading"}
                  className="w-full ui-action border px-4 py-2 font-black uppercase tracking-widest hover:bg-bg-hover transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {contactStatus.state === "loading" ? "Sending..." : "Send"}
                </button>

                {contactStatus.state === "success" ? <p className="text-xs ui-muted">{contactStatus.message}</p> : null}
                {contactStatus.state === "error" ? <p className="text-xs ui-muted text-red-600">{contactStatus.message}</p> : null}
              </div>
            </form>
          </div>
        </section>
      </div>

      <EditPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
        collectionName={selectedCollection}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <Footer />
    </div>
  );
};

const ControlButtons = ({ onEdit, onDelete }) => (
  <div className="flex gap-1 shrink-0">
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
      className="p-2 ui-muted hover:text-text hover:bg-bg-hover transition-all cursor-pointer"
    >
      <IoPencilOutline size={18} />
    </button>
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete();
      }}
      className="p-2 ui-muted hover:text-red-600 hover:bg-bg-hover transition-all cursor-pointer"
    >
      <IoTrashOutline size={18} />
    </button>
  </div>
);

const ExperienceCard = ({ id, duration, title, org, image, desc, isAdmin, onEdit, onDelete }) => (
  <Link
    to={toExperienceDetail(id)}
    className="group flex flex-col md:flex-row ui-surface shadow-md hover:shadow-lg transition overflow-hidden border ui-border border-l-4 border-l-text"
    aria-label={`Open experience: ${title}`}
  >
    {image ? (
      <div className="relative w-full h-44 sm:h-56 md:w-44 md:h-auto shrink-0 border-b md:border-b-0 md:border-r ui-border overflow-hidden">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
    ) : null}
    <div className="flex-1 p-6 flex flex-col sm:flex-row justify-between items-start gap-4 min-w-0">
      <div className="flex-grow min-w-0 flex flex-col max-h-48 overflow-hidden">
        <span className="text-xs font-black uppercase tracking-widest ui-muted opacity-80">
          {duration}
          {duration?.toLowerCase().includes("present") ? <span className="ml-1 text-orange-400/80">(ongoing)</span> : null}
        </span>
        <h3 className="text-lg font-black text-text mt-1 capitalize break-words line-clamp-1 group-hover:underline">{title}</h3>
        <p className="text-sm font-black ui-muted mb-3 break-words line-clamp-1">{org}</p>
        <p className="text-sm ui-muted leading-relaxed break-words line-clamp-3">{desc}</p>
      </div>
      {isAdmin ? (
        <div className="sm:pt-1 self-end sm:self-auto">
          <ControlButtons onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : null}
    </div>
  </Link>
);

const ProjectCard = ({ id, title, tags, desc, image, isAdmin, onEdit, onDelete, role, duration }) => (
  <Link
    to={toProjectDetail(id)}
    className="group flex flex-col md:flex-row ui-surface shadow-md hover:shadow-lg transition overflow-hidden border ui-border border-l-4 border-l-text"
    aria-label={`Open project: ${title}`}
  >
    {image ? (
      <div className="relative w-full h-44 sm:h-56 md:w-44 md:h-auto shrink-0 border-b md:border-b-0 md:border-r ui-border overflow-hidden">
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
    ) : null}
    <div className="flex-1 p-6 flex flex-col sm:flex-row justify-between items-start gap-4 min-w-0">
      <div className="flex-grow min-w-0 flex flex-col max-h-48 overflow-hidden">
        <span className="text-xs font-black uppercase tracking-widest ui-muted opacity-80">
          {duration}
          {duration?.toLowerCase().includes("present") ? <span className="ml-1 text-orange-400/80">(ongoing)</span> : null}
        </span>
        <h3 className="text-lg font-black text-text mb-2 break-words line-clamp-1 group-hover:underline">{title}</h3>
        <p className="text-sm font-black ui-muted mb-3 break-words line-clamp-1">{role}</p>
        <div className="flex flex-nowrap gap-2 mb-4 overflow-hidden">
          {tags?.map((tag) => (
            <span key={tag} className="text-[10px] font-black ui-pill border px-2 py-1 uppercase tracking-wider shrink-0 max-w-[10rem] truncate">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm ui-muted leading-relaxed break-words line-clamp-3">{desc}</p>
      </div>
      {isAdmin ? (
        <div className="sm:pt-1 self-end sm:self-auto">
          <ControlButtons onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : null}
    </div>
  </Link>
);

const EducationCard = ({ year, degree, institution, desc, isAdmin, onEdit, onDelete }) => (
  <div className="ui-surface p-6 shadow-md border-l-4 border-l-text hover:shadow-lg transition flex flex-row justify-between items-start border ui-border overflow-hidden">
    <div className="pr-4">
      <span className="text-sm ui-muted font-black uppercase tracking-widest opacity-80">{year}</span>
      <h3 className="text-lg font-bold text-text mt-1 capitalize">{degree}</h3>
      <p className="text-sm font-black ui-muted mb-2 capitalize">{institution}</p>
      <p className="text-sm ui-muted">{desc}</p>
    </div>
    {isAdmin ? <ControlButtons onEdit={onEdit} onDelete={onDelete} /> : null}
  </div>
);

const ContactRow = ({ icon, label, value, href }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 ui-muted">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs font-black uppercase tracking-widest ui-muted">{label}</div>
      {href ? (
        <a
          className="text-sm font-black hover:underline break-words"
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {value}
        </a>
      ) : (
        <div className="text-sm font-black break-words">{value}</div>
      )}
    </div>
  </div>
);

export default PortfolioPage;
