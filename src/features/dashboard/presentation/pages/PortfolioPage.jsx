import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoArrowForwardOutline,
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
    <div className="min-h-screen bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[#151513] selection:bg-[#ff5a36] selection:text-[#151513]">
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

      <header className="border-b-2 border-[#151513] px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-7 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em]">
              <span className="h-[3px] w-10 bg-[#ff5a36]" />
              Software Engineer / Kuala Lumpur
            </div>

            <h1 className="font-display text-[clamp(4.4rem,12vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.085em]">
              Tengku
              <span className="block text-[#ff5a36]">Haikal.</span>
            </h1>

            <p className="mt-8 max-w-xl border-l-4 border-[#151513] pl-5 text-base font-black leading-relaxed text-[#5d5d56] sm:text-lg">
              Universiti Malaya <br /> Bachelor of Computer Science (Software Engineering)
            </p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#5d5d56] sm:text-base">
              A curious developer who enjoys transforming ideas into real applications that people can use and benefit from.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#projects"
                className="inline-flex min-h-12 items-center justify-between gap-8 border-2 border-[#151513] bg-[#ff5a36] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[5px_5px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-4"
              >
                View projects <IoArrowForwardOutline size={18} />
              </a>
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-center border-2 border-[#151513] bg-[#fbf8f0] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[5px_5px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-4"
              >
                Start a conversation
              </a>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden border-2 border-[#151513] bg-[#242421] shadow-[8px_8px_0_#151513] sm:min-h-[540px]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:38px_38px]" />
            <div className="absolute -right-14 top-16 h-7 w-64 rotate-45 bg-[#ff5a36]" />
            <div className="absolute -left-14 bottom-20 h-7 w-64 -rotate-45 bg-[#ff5a36]" />
            <div className="absolute left-6 top-6 z-10 border-2 border-[#fbf8f0] bg-[#151513] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#fbf8f0]">
              Profile / 001
            </div>
            <div className="absolute bottom-8 left-1/2 z-10 w-[72%] -translate-x-1/2 -rotate-2 border-2 border-[#151513] bg-[#fbf8f0] p-3 shadow-[7px_7px_0_#ff5a36] transition duration-300 hover:rotate-0 sm:bottom-12 sm:w-[64%] sm:p-4">
              <img src="/profile.jpg" alt="Tengku Haikal" className="aspect-[4/5] w-full border-2 border-[#151513] object-cover grayscale transition duration-300 hover:grayscale-0" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]">Software Engineering</span>
                <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[#151513] bg-[#ff5a36]" />
              </div>
            </div>
            <div className="absolute right-5 top-5 z-10 grid h-20 w-20 rotate-12 place-items-center rounded-full border-2 border-[#ff5a36] text-center text-[9px] font-black uppercase leading-tight tracking-[0.1em] text-[#ff5a36]">
              Build
              <br />
              with care
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="experience" className="scroll-mt-16 border-b-2 border-[#151513] bg-[#f2efe7]/90 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading number="01" title="Experience" />
            <div className="mt-12 grid gap-7">
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
          </div>
        </section>

        <section id="projects" className="relative scroll-mt-16 overflow-hidden border-b-2 border-[#151513] bg-[#242421] px-4 py-20 text-[#fbf8f0] sm:px-6 sm:py-28">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute right-0 top-0 h-2 w-1/3 bg-[#ff5a36]" />
          <div className="relative mx-auto max-w-7xl">
            <SectionHeading number="02" title="Projects" dark />
            <div className="mt-12 grid gap-7 lg:grid-cols-2">
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
          </div>
        </section>

        <section id="education" className="scroll-mt-16 border-b-2 border-[#151513] bg-[#fbf8f0]/80 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading number="03" title="Education" />
            <div className="mt-12 grid gap-7 lg:grid-cols-2">
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
          </div>
        </section>

        <section id="contact" className="scroll-mt-16 border-b-2 border-[#151513] bg-[#ff5a36] px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading number="04" title="Contact" />

            <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
              <div className="border-2 border-[#151513] bg-[#242421] p-6 text-[#fbf8f0] shadow-[7px_7px_0_#151513] sm:p-8">
                <p className="mb-8 max-w-md text-sm leading-7 text-[#c7c5bd]">
                  Want to collaborate or have a question? Send a message or reach me via the links below.
                </p>

                <div className="flex flex-col gap-4">
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

              <form onSubmit={handleContactSubmit} className="border-2 border-[#151513] bg-[#fbf8f0] p-6 shadow-[7px_7px_0_#151513] sm:p-8">
                <div className="grid grid-cols-1 gap-5">
                  <div className="hidden" aria-hidden="true">
                    <label className="text-xs font-black uppercase tracking-[0.12em] text-[#5d5d56]">Website</label>
                    <input
                      value={contactForm.website}
                      onChange={handleContactChange("website")}
                      autoComplete="off"
                      tabIndex={-1}
                      className="w-full border-2 border-[#151513] bg-transparent px-4 py-3"
                      placeholder="https://"
                    />
                  </div>

                  <ContactField label="Name">
                    <input
                      value={contactForm.name}
                      onChange={handleContactChange("name")}
                      className="w-full border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </ContactField>

                  <ContactField label="Email">
                    <input
                      value={contactForm.email}
                      onChange={handleContactChange("email")}
                      className="w-full border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                    />
                  </ContactField>

                  <ContactField label="Message">
                    <textarea
                      value={contactForm.message}
                      onChange={handleContactChange("message")}
                      className="min-h-[150px] w-full resize-y border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
                      placeholder="Tell me what you're building..."
                    />
                  </ContactField>

                  <button
                    type="submit"
                    disabled={contactStatus.state === "loading"}
                    className="inline-flex min-h-12 w-full items-center justify-between border-2 border-[#151513] bg-[#ff5a36] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {contactStatus.state === "loading" ? "Sending..." : "Send"} <IoArrowForwardOutline size={18} />
                  </button>

                  {contactStatus.state === "success" ? <p className="border-l-4 border-[#36a166] pl-3 text-xs font-bold text-[#246f46]">{contactStatus.message}</p> : null}
                  {contactStatus.state === "error" ? <p className="border-l-4 border-[#d84833] pl-3 text-xs font-bold text-[#d84833]">{contactStatus.message}</p> : null}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

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

const SectionHeading = ({ number, title, dark = false }) => (
  <div className={`grid items-end gap-5 border-b-2 pb-6 sm:grid-cols-[auto_1fr] ${dark ? "border-[#77756e]" : "border-[#151513]"}`}>
    <span className="font-serif text-3xl font-black italic text-[#ff5a36]">{number}</span>
    <h2 className={`font-display text-[clamp(3.5rem,9vw,7rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] ${dark ? "text-[#fbf8f0]" : "text-[#151513]"}`}>
      {title}
    </h2>
  </div>
);

const ContactField = ({ label, children }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">{label}</span>
    {children}
  </label>
);

const ControlButtons = ({ onEdit, onDelete }) => (
  <div className="flex shrink-0 gap-2">
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
      className="grid h-10 w-10 cursor-pointer place-items-center border-2 border-[#151513] bg-[#fbf8f0] text-[#5d5d56] shadow-[2px_2px_0_#151513] transition hover:-translate-y-0.5 hover:bg-[#ff5a36] hover:text-[#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
      aria-label="Edit entry"
    >
      <IoPencilOutline size={18} />
    </button>
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete();
      }}
      className="grid h-10 w-10 cursor-pointer place-items-center border-2 border-[#151513] bg-[#fbf8f0] text-[#5d5d56] shadow-[2px_2px_0_#151513] transition hover:-translate-y-0.5 hover:bg-[#d84833] hover:text-[#fbf8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
      aria-label="Delete entry"
    >
      <IoTrashOutline size={18} />
    </button>
  </div>
);

const ExperienceCard = ({ id, duration, title, org, image, desc, isAdmin, onEdit, onDelete }) => (
  <Link
    to={toExperienceDetail(id)}
    className="group flex flex-col overflow-hidden border-2 border-[#151513] bg-[#fbf8f0] shadow-[6px_6px_0_#151513] transition hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-[8px_9px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-4 md:flex-row"
    aria-label={`Open experience: ${title}`}
  >
    {image ? (
      <div className="relative h-52 w-full shrink-0 overflow-hidden border-b-2 border-[#151513] md:h-auto md:w-60 md:border-b-0 md:border-r-2">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 group-hover:grayscale-0" loading="lazy" />
        <div className="absolute inset-0 bg-[#ff5a36]/0 transition group-hover:bg-[#ff5a36]/10" />
      </div>
    ) : null}
    <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:p-8">
      <div className="flex min-w-0 flex-grow flex-col overflow-hidden">
        <span className="mb-3 w-fit border border-[#151513] bg-[#f2efe7] px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">
          {duration}
          {duration?.toLowerCase().includes("present") ? <span className="ml-1 text-[#ff5a36]">(ongoing)</span> : null}
        </span>
        <h3 className="line-clamp-2 break-words font-display text-2xl font-black uppercase leading-tight tracking-tight text-[#151513] decoration-[#ff5a36] decoration-4 underline-offset-4 group-hover:underline sm:text-3xl">{title}</h3>
        <p className="mb-4 mt-2 line-clamp-1 break-words text-xs font-black uppercase tracking-[0.1em] text-[#5d5d56]">{org}</p>
        <p className="line-clamp-3 break-words text-sm leading-7 text-[#5d5d56]">{desc}</p>
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
    className="group flex h-full flex-col overflow-hidden border-2 border-[#151513] bg-[#fbf8f0] text-[#151513] shadow-[6px_6px_0_#ff5a36] transition hover:-translate-y-1 hover:shadow-[8px_9px_0_#ff5a36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-4 focus-visible:ring-offset-[#242421]"
    aria-label={`Open project: ${title}`}
  >
    {image ? (
      <div className="relative h-56 w-full shrink-0 overflow-hidden border-b-2 border-[#151513]">
        <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 group-hover:scale-[1.02] group-hover:grayscale-0" loading="lazy" />
        <div className="absolute left-4 top-4 border-2 border-[#151513] bg-[#ff5a36] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#151513]">
          Project
        </div>
      </div>
    ) : null}
    <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-5 p-6 sm:flex-row">
      <div className="flex min-w-0 flex-grow flex-col overflow-hidden">
        <span className="mb-3 text-[9px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">
          {duration}
          {duration?.toLowerCase().includes("present") ? <span className="ml-1 text-[#ff5a36]">(ongoing)</span> : null}
        </span>
        <h3 className="line-clamp-2 break-words font-display text-2xl font-black uppercase leading-tight tracking-tight decoration-[#ff5a36] decoration-4 underline-offset-4 group-hover:underline sm:text-3xl">{title}</h3>
        <p className="mb-4 mt-2 line-clamp-1 break-words text-xs font-black uppercase tracking-[0.1em] text-[#5d5d56]">{role}</p>
        <div className="mb-4 flex flex-wrap gap-2 overflow-hidden">
          {tags?.map((tag) => (
            <span key={tag} className="max-w-[10rem] shrink-0 truncate border border-[#151513] bg-[#f2efe7] px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em]">
              {tag}
            </span>
          ))}
        </div>
        <p className="line-clamp-3 break-words text-sm leading-7 text-[#5d5d56]">{desc}</p>
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
  <div className="flex min-h-72 flex-row items-start justify-between overflow-hidden border-2 border-[#151513] bg-[#fbf8f0] p-6 shadow-[6px_6px_0_rgba(21,21,19,0.18)] transition hover:-translate-y-1 hover:shadow-[8px_9px_0_rgba(21,21,19,0.18)] sm:p-8">
    <div className="pr-4">
      <span className="inline-block border-2 border-[#151513] bg-[#ff5a36] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#151513]">{year}</span>
      <h3 className="mt-9 font-display text-2xl font-black uppercase leading-tight tracking-tight text-[#151513] sm:text-3xl">{degree}</h3>
      <p className="mb-4 mt-2 text-xs font-black uppercase tracking-[0.1em] text-[#5d5d56]">{institution}</p>
      <p className="text-sm leading-7 text-[#5d5d56]">{desc}</p>
    </div>
    {isAdmin ? <ControlButtons onEdit={onEdit} onDelete={onDelete} /> : null}
  </div>
);

const ContactRow = ({ icon, label, value, href }) => (
  <div className="flex items-center gap-4 border-2 border-[#77756e] p-4 transition hover:border-[#ff5a36]">
    <div className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#fbf8f0] bg-[#ff5a36] text-[#151513]">{icon}</div>
    <div className="min-w-0">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#aaa89f]">{label}</div>
      {href ? (
        <a
          className="break-words text-sm font-black text-[#fbf8f0] decoration-[#ff5a36] decoration-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {value}
        </a>
      ) : (
        <div className="break-words text-sm font-black text-[#fbf8f0]">{value}</div>
      )}
    </div>
  </div>
);

export default PortfolioPage;
