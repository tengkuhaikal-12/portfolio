import { useEffect, useMemo, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import AlertModal from "@/shared/components/AlertModal";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { updatePortfolioItem } from "@/features/dashboard/data/portfolioService";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, index) => currentYear - index);

const EditPortfolioModal = ({ isOpen, onClose, data, collectionName, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    links: [],
  });

  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);

  const [startMonth, setStartMonth] = useState("Jan");
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endMonth, setEndMonth] = useState("Jan");
  const [endYear, setEndYear] = useState("Present");

  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "" });
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  useEffect(() => {
    if (!data) return;

    const nextForm = {
      title: data.title || "",
      subtitle: data.subtitle || "",
      description: data.description || "",
      image: data.image || "",
      links: Array.isArray(data.links) ? data.links : [],
    };

    setFormData(nextForm);
    setTechStack(Array.isArray(data.techStack) ? data.techStack : []);

    let nextStartMonth = "Jan";
    let nextStartYear = String(currentYear);
    let nextEndMonth = "Jan";
    let nextEndYear = "Present";

    if (data.duration) {
      const [startRaw, endRaw] = String(data.duration).split(" - ");
      const [parsedStartMonth, parsedStartYear] = String(startRaw || "").split(" ");

      if (parsedStartMonth && parsedStartYear) {
        nextStartMonth = parsedStartMonth;
        nextStartYear = parsedStartYear;
      }

      if (endRaw && endRaw !== "Present") {
        const [parsedEndMonth, parsedEndYear] = endRaw.split(" ");
        if (parsedEndMonth && parsedEndYear) {
          nextEndMonth = parsedEndMonth;
          nextEndYear = parsedEndYear;
        }
      }
    }

    setStartMonth(nextStartMonth);
    setStartYear(nextStartYear);
    setEndMonth(nextEndMonth);
    setEndYear(nextEndYear);

    setInitialSnapshot({
      formData: nextForm,
      techStack: Array.isArray(data.techStack) ? data.techStack : [],
      startMonth: nextStartMonth,
      startYear: nextStartYear,
      endMonth: nextEndMonth,
      endYear: nextEndYear,
    });
  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setDiscardConfirmOpen(false);
      setAlertState({ open: false, title: "", message: "" });
      setLoading(false);
    }
  }, [isOpen]);

  const currentSnapshot = useMemo(
    () => ({
      formData,
      techStack,
      startMonth,
      startYear,
      endMonth,
      endYear,
    }),
    [formData, techStack, startMonth, startYear, endMonth, endYear]
  );

  const isDirty = initialSnapshot ? JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot) : false;

  if (!isOpen || !data) return null;

  const inputClass =
    "w-full border-2 border-[#151513] bg-[#f2efe7] p-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2";

  const handleAddTech = (event) => {
    if (event.key !== "Enter" && event.key !== ",") return;

    event.preventDefault();
    const value = techInput.trim().replace(/,/g, "");
    if (!value || techStack.includes(value)) {
      setTechInput("");
      return;
    }

    setTechStack((current) => [...current, value]);
    setTechInput("");
  };

  const removeTech = (index) => {
    setTechStack((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setFormData((current) => ({ ...current, image: reader.result }));
  };

  const requestClose = () => {
    if (loading) return;
    if (!isDirty) {
      onClose?.();
      return;
    }
    setDiscardConfirmOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const startMonthIndex = MONTHS.indexOf(startMonth);
      const sortValue = Number.parseInt(startYear, 10) * 12 + startMonthIndex;

      const duration =
        endYear === "Present"
          ? `${startMonth} ${startYear} - Present`
          : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

      const payload = {
        ...formData,
        duration,
        sortDate: sortValue,
        techStack: collectionName === "projects" ? techStack : [],
      };

      await updatePortfolioItem(collectionName, data.id, payload);
      onUpdateSuccess(collectionName, { ...payload, id: data.id });
      onClose?.();
    } catch (error) {
      setAlertState({ open: true, title: "Update failed", message: error?.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#151513]/80 p-4 backdrop-blur-sm">
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ open: false, title: "", message: "" })}
      />

      <ConfirmModal
        isOpen={discardConfirmOpen}
        title="Discard unsaved changes?"
        message="You have unsaved changes. Discard them?"
        danger
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onCancel={() => setDiscardConfirmOpen(false)}
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          onClose?.();
        }}
      />

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-2 border-[#151513] bg-[#fbf8f0] text-[#151513] shadow-[8px_8px_0_#ff5a36]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#151513] bg-[#242421] p-6 text-[#fbf8f0]">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">Edit {collectionName}</h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            className="cursor-pointer border-2 border-[#fbf8f0] bg-[#ff5a36] p-1 text-[#151513] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] disabled:opacity-60"
          >
            <IoCloseOutline size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Title</label>
              <input
                required
                className={inputClass}
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Subtitle / Role</label>
              <input
                required
                className={inputClass}
                value={formData.subtitle}
                onChange={(event) => setFormData((current) => ({ ...current, subtitle: event.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={startMonth} onChange={(event) => setStartMonth(event.target.value)}>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select className={inputClass} value={startYear} onChange={(event) => setStartYear(event.target.value)}>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className={inputClass}
                  value={endMonth}
                  onChange={(event) => setEndMonth(event.target.value)}
                  disabled={endYear === "Present"}
                >
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>

                <select className={inputClass} value={endYear} onChange={(event) => setEndYear(event.target.value)}>
                  <option value="Present">Present</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {collectionName === "projects" ? (
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Tech Stack (Enter to add)</label>
                <input
                  className={inputClass}
                  value={techInput}
                  onKeyDown={handleAddTech}
                  onChange={(event) => setTechInput(event.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech, index) => (
                    <span key={`${tech}-${index}`} className="border border-[#151513] bg-[#f2efe7] px-2 py-1 text-[10px] font-bold">
                      {tech}
                      <button type="button" onClick={() => removeTech(index)} className="ml-1 text-red-500">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Description</label>
              <textarea
                rows="4"
                className={inputClass}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Links</label>
              <div className="space-y-3">
                {(formData.links || []).map((link, index) => (
                  <div key={`${link?.href || "link"}-${index}`} className="space-y-2 border-2 border-[#151513] bg-[#f2efe7] p-3">
                    <input
                      className={inputClass}
                      placeholder="Label (GitHub, Website, Demo...)"
                      value={link.label || ""}
                      onChange={(event) => {
                        const links = [...(formData.links || [])];
                        links[index] = { ...links[index], label: event.target.value };
                        setFormData((current) => ({ ...current, links }));
                      }}
                    />
                    <input
                      className={inputClass}
                      placeholder="URL"
                      value={link.href || ""}
                      onChange={(event) => {
                        const links = [...(formData.links || [])];
                        links[index] = { ...links[index], href: event.target.value };
                        setFormData((current) => ({ ...current, links }));
                      }}
                    />
                    <select
                      className={inputClass}
                      value={link.kind || "visit"}
                      onChange={(event) => {
                        const links = [...(formData.links || [])];
                        links[index] = { ...links[index], kind: event.target.value };
                        setFormData((current) => ({ ...current, links }));
                      }}
                    >
                      <option value="visit">Visit</option>
                      <option value="github">GitHub</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const links = (formData.links || []).filter((_, itemIndex) => itemIndex !== index);
                        setFormData((current) => ({ ...current, links }));
                      }}
                      className="text-sm font-black uppercase text-[#d84833] underline decoration-2 underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const links = [...(formData.links || []), { label: "", href: "", kind: "visit" }];
                    setFormData((current) => ({ ...current, links }));
                  }}
                  className="w-full border-2 border-[#151513] bg-[#f2efe7] py-3 text-sm font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_#151513] transition hover:bg-[#ff5a36]"
                >
                  Add Link
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">Update Image</label>
              <input type="file" onChange={handleImage} className="text-xs cursor-pointer block w-full" />
              {formData.image ? <img src={formData.image} className="mt-2 h-16 border-2 border-[#151513]" alt="preview" /> : null}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full border-2 border-[#151513] bg-[#ff5a36] py-4 font-black uppercase tracking-[0.14em] shadow-[5px_5px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] disabled:opacity-60 md:col-span-2"
          >
            {loading ? "Saving changes..." : "Update portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPortfolioModal;
