import { useEffect, useMemo, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import AlertModal from "@/shared/components/AlertModal";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { updatePortfolioItem } from "@/features/dashboard/data/portfolioService";
import { dataUrlToFile, isDataUrlImage, uploadImage, validateImageFile } from "@/shared/services/firebase/imageUpload";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, index) => currentYear - index);
const DEFAULT_IMAGE_POSITION = "50% 50%";

const parseImagePosition = (position = DEFAULT_IMAGE_POSITION) => {
  const [x = "50%", y = "50%"] = String(position).split(" ");
  return {
    x: Number.parseInt(x, 10) || 50,
    y: Number.parseInt(y, 10) || 50,
  };
};

const formatImagePosition = (x, y) => `${x}% ${y}%`;

const focalPresets = [
  { label: "Top", value: "50% 0%" },
  { label: "Head", value: "50% 18%" },
  { label: "Center", value: DEFAULT_IMAGE_POSITION },
  { label: "Bottom", value: "50% 100%" },
];

const EditPortfolioModal = ({ isOpen, onClose, data, collectionName, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    imagePosition: DEFAULT_IMAGE_POSITION,
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
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  useEffect(() => {
    if (!data || !isOpen) return;

    const nextForm = {
      title: data.title || "",
      subtitle: data.subtitle || "",
      description: data.description || "",
      image: data.image || "",
      imagePosition: data.imagePosition || DEFAULT_IMAGE_POSITION,
      links: Array.isArray(data.links) ? data.links : [],
    };

    setFormData(nextForm);
    setTechStack(Array.isArray(data.techStack) ? data.techStack : []);
    setSelectedImageFile(null);
    setImagePreviewUrl(data.image || "");
    setImageUploadProgress(0);

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
      selectedImage: "",
    });
  }, [data, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDiscardConfirmOpen(false);
      setAlertState({ open: false, title: "", message: "" });
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const currentSnapshot = useMemo(
    () => ({
      formData,
      techStack,
      startMonth,
      startYear,
      endMonth,
      endYear,
      selectedImage: selectedImageFile ? `${selectedImageFile.name}:${selectedImageFile.size}:${selectedImageFile.lastModified}` : "",
    }),
    [formData, techStack, startMonth, startYear, endMonth, endYear, selectedImageFile]
  );

  const isDirty = initialSnapshot ? JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot) : false;

  if (!isOpen || !data) return null;

  const inputClass =
    "w-full border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2";
  const imagePosition = parseImagePosition(formData.imagePosition);

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

    try {
      validateImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setImagePreviewUrl(previewUrl);
      setImageUploadProgress(0);
    } catch (error) {
      event.target.value = "";
      setSelectedImageFile(null);
      setImagePreviewUrl(formData.image || "");
      setImageUploadProgress(0);
      setAlertState({
        open: true,
        title: "Image not uploaded",
        message: error?.message || "Please choose a valid image.",
      });
    }
  };

  const updateImagePosition = (axis, value) => {
    const nextValue = Number.parseInt(value, 10);
    setFormData((current) => {
      const currentPosition = parseImagePosition(current.imagePosition);
      const nextX = axis === "x" ? nextValue : currentPosition.x;
      const nextY = axis === "y" ? nextValue : currentPosition.y;
      return { ...current, imagePosition: formatImagePosition(nextX, nextY) };
    });
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

      let imageUrl = formData.image;
      if (selectedImageFile) {
        setImageUploadProgress(1);
        imageUrl = await uploadImage(selectedImageFile, {
          folder: `portfolio/${collectionName}/${data.id}`,
          onProgress: setImageUploadProgress,
        });
      } else if (isDataUrlImage(imageUrl)) {
        setImageUploadProgress(1);
        imageUrl = await uploadImage(dataUrlToFile(imageUrl, `${data.id || "image"}.jpg`), {
          folder: `portfolio/${collectionName}/${data.id}`,
          onProgress: setImageUploadProgress,
        });
      }

      const payload = {
        ...formData,
        image: imageUrl,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(var(--color-ink-rgb)/0.8)] p-4 backdrop-blur-sm">
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

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[8px_8px_0_var(--color-accent)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-6 text-[var(--color-paper-light)]">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight">Edit {collectionName}</h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            className="cursor-pointer border-2 border-[var(--color-paper-light)] bg-[var(--color-accent)] p-1 text-[var(--color-ink)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60"
          >
            <IoCloseOutline size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Title</label>
              <input
                required
                className={inputClass}
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Subtitle / Role</label>
              <input
                required
                className={inputClass}
                value={formData.subtitle}
                onChange={(event) => setFormData((current) => ({ ...current, subtitle: event.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Duration</label>
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
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Tech Stack (Enter to add)</label>
                <input
                  className={inputClass}
                  value={techInput}
                  onKeyDown={handleAddTech}
                  onChange={(event) => setTechInput(event.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech, index) => (
                    <span key={`${tech}-${index}`} className="border border-[var(--color-ink)] bg-[var(--color-paper)] px-2 py-1 text-[10px] font-bold">
                      {tech}
                      <button type="button" onClick={() => removeTech(index)} className="ml-1 text-[var(--color-danger)]">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Description</label>
              <textarea
                rows="4"
                className={inputClass}
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Links</label>
              <div className="space-y-3">
                {(formData.links || []).map((link, index) => (
                  <div key={`${link?.href || "link"}-${index}`} className="space-y-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-3">
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
                      className="text-sm font-black uppercase text-[var(--color-danger)] underline decoration-2 underline-offset-4"
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
                  className="w-full border-2 border-[var(--color-ink)] bg-[var(--color-paper)] py-3 text-sm font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-[var(--color-accent)]"
                >
                  Add Link
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">Update Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImage}
                disabled={loading}
                className="block w-full cursor-pointer text-xs disabled:opacity-60"
              />
              {imagePreviewUrl || formData.image ? (
                <div className="mt-4 space-y-4 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4 shadow-[4px_4px_0_var(--color-ink)]">
                  <div className="overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-panel)]">
                    <img
                      src={imagePreviewUrl || formData.image}
                      className="h-48 w-full object-cover grayscale"
                      style={{ objectPosition: formData.imagePosition }}
                      alt="preview"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        Image focus
                      </label>
                      <span className="border border-[var(--color-ink)] bg-[var(--color-paper-light)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        {formData.imagePosition}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {focalPresets.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormData((current) => ({ ...current, imagePosition: preset.value }))}
                          className={`border-2 border-[var(--color-ink)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] shadow-[2px_2px_0_var(--color-ink)] transition hover:bg-[var(--color-accent)] ${
                            formData.imagePosition === preset.value ? "bg-[var(--color-accent)]" : "bg-[var(--color-paper-light)]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedImageFile || (isDataUrlImage(formData.image) && loading) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-muted)]">
                          <span>{selectedImageFile?.name || "Migrating legacy image"}</span>
                          <span>{imageUploadProgress}%</span>
                        </div>
                        <div className="h-2 border border-[var(--color-ink)] bg-[var(--color-paper-light)]">
                          <div
                            className="h-full bg-[var(--color-accent)] transition-[width]"
                            style={{ width: `${imageUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Move left / right
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.x}
                      onChange={(event) => updateImagePosition("x", event.target.value)}
                      className="w-full accent-[var(--color-accent)]"
                    />
                    <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Move up / down
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.y}
                      onChange={(event) => updateImagePosition("y", event.target.value)}
                      className="w-full accent-[var(--color-accent)]"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] py-4 font-black uppercase tracking-[0.14em] shadow-[5px_5px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60 md:col-span-2"
          >
            {loading && (selectedImageFile || isDataUrlImage(formData.image)) && imageUploadProgress < 100
              ? `Uploading image ${imageUploadProgress}%...`
              : loading
                ? "Saving changes..."
                : "Update portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPortfolioModal;
