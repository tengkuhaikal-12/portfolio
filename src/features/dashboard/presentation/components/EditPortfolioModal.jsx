import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

import AlertModal from "@/shared/components/AlertModal";
import ConfirmModal from "@/shared/components/ConfirmModal";

import { updatePortfolioItem } from "@/features/dashboard/data/portfolioService";

import {
  dataUrlToFile,
  isDataUrlImage,
  uploadImage,
  validateImageFile,
} from "@/shared/services/firebase/imageUpload";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();

const YEARS = Array.from(
  { length: currentYear - 1960 + 1 },
  (_, index) => String(currentYear - index)
);

const DEFAULT_IMAGE_POSITION = "50% 50%";

const FOCAL_PRESETS = [
  { label: "Top", value: "50% 0%" },
  { label: "Head", value: "50% 18%" },
  { label: "Center", value: DEFAULT_IMAGE_POSITION },
  { label: "Bottom", value: "50% 100%" },
];

const EMPTY_ALERT = {
  open: false,
  title: "",
  message: "",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const parseImagePosition = (position = DEFAULT_IMAGE_POSITION) => {
  const [rawX = "50%", rawY = "50%"] = String(position).split(/\s+/);

  const parseAxis = (value) => {
    const number = Number.parseFloat(value);

    if (!Number.isFinite(number)) return 50;

    return Math.min(100, Math.max(0, number));
  };

  return {
    x: parseAxis(rawX),
    y: parseAxis(rawY),
  };
};

const formatImagePosition = (x, y) => `${x}% ${y}%`;

const getMonthValue = (month, year) => {
  return Number(year) * 12 + MONTHS.indexOf(month);
};

const parseDuration = (duration) => {
  const fallback = {
    startMonth: "Jan",
    startYear: String(currentYear),
    endMonth: "Jan",
    endYear: "Present",
  };

  if (!duration) return fallback;

  const [startRaw, endRaw] = String(duration).split(" - ");

  const [parsedStartMonth, parsedStartYear] = String(startRaw || "")
    .trim()
    .split(/\s+/);

  const result = { ...fallback };

  if (
    MONTHS.includes(parsedStartMonth) &&
    /^\d{4}$/.test(parsedStartYear || "")
  ) {
    result.startMonth = parsedStartMonth;
    result.startYear = parsedStartYear;
  }

  if (endRaw && endRaw.trim() !== "Present") {
    const [parsedEndMonth, parsedEndYear] = endRaw.trim().split(/\s+/);

    if (
      MONTHS.includes(parsedEndMonth) &&
      /^\d{4}$/.test(parsedEndYear || "")
    ) {
      result.endMonth = parsedEndMonth;
      result.endYear = parsedEndYear;
    }
  }

  return result;
};

const normalizeLinks = (links) => {
  if (!Array.isArray(links)) return [];

  return links.map((link) => ({
    label: link?.label || "",
    href: link?.href || "",
    kind: link?.kind || "visit",
  }));
};

const createSnapshot = ({
  formData,
  techStack,
  startMonth,
  startYear,
  endMonth,
  endYear,
  selectedImageFile,
}) => ({
  formData: {
    ...formData,
    links: normalizeLinks(formData.links),
  },
  techStack: [...techStack],
  startMonth,
  startYear,
  endMonth,
  endYear,
  selectedImage: selectedImageFile
    ? [
      selectedImageFile.name,
      selectedImageFile.size,
      selectedImageFile.lastModified,
    ].join(":")
    : "",
});

const validateLinks = (links) => {
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];
    const label = String(link?.label || "").trim();
    const href = String(link?.href || "").trim();

    if (!label || !href) {
      return `Link ${index + 1}: enter both a label and a URL.`;
    }

    try {
      const url = new URL(href);

      if (!["http:", "https:"].includes(url.protocol)) {
        return `Link ${index + 1}: only HTTP and HTTPS URLs are allowed.`;
      }
    } catch {
      return `Link ${index + 1}: enter a valid URL, including https://.`;
    }

    if (link.kind && !["visit", "github"].includes(link.kind)) {
      return `Link ${index + 1}: select a valid link type.`;
    }
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

const SectionHeading = ({ number, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-xs font-black">
      {number}
    </span>

    <div className="min-w-0">
      <h3 className="text-sm font-black uppercase tracking-[0.12em]">
        {title}
      </h3>

      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  </div>
);

const FieldLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]"
  >
    {children}
  </label>
);

const inputClass =
  "w-full min-w-0 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const buttonClass =
  "inline-flex items-center justify-center gap-2 border-2 border-[var(--color-ink)] px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const EditPortfolioModal = ({
  isOpen,
  onClose,
  data,
  collectionName,
  onUpdateSuccess,
}) => {
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

  const [alertState, setAlertState] = useState(EMPTY_ALERT);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const imagePreviewUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /* Image preview cleanup                                                    */
  /* ------------------------------------------------------------------------ */

  const releaseImagePreview = useCallback(() => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      releaseImagePreview();
    };
  }, [releaseImagePreview]);

  /* ------------------------------------------------------------------------ */
  /* Initialize the form                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isOpen || !data) return;

    releaseImagePreview();

    const nextForm = {
      title: data.title || "",
      subtitle: data.subtitle || "",
      description: data.description || "",
      image: data.image || "",
      imagePosition: data.imagePosition || DEFAULT_IMAGE_POSITION,
      links: normalizeLinks(data.links),
    };

    const nextTechStack = Array.isArray(data.techStack)
      ? [...data.techStack]
      : [];

    const duration = parseDuration(data.duration);

    setFormData(nextForm);
    setTechStack(nextTechStack);
    setTechInput("");

    setStartMonth(duration.startMonth);
    setStartYear(duration.startYear);
    setEndMonth(duration.endMonth);
    setEndYear(duration.endYear);

    setSelectedImageFile(null);
    setImagePreviewUrl(data.image || "");
    setImageUploadProgress(0);

    setDiscardConfirmOpen(false);
    setAlertState(EMPTY_ALERT);
    setLoading(false);

    setInitialSnapshot(
      createSnapshot({
        formData: nextForm,
        techStack: nextTechStack,
        ...duration,
        selectedImageFile: null,
      })
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [data, isOpen, releaseImagePreview]);

  /* ------------------------------------------------------------------------ */
  /* Reset transient state when the modal closes                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (isOpen) return;

    releaseImagePreview();

    setSelectedImageFile(null);
    setImagePreviewUrl("");
    setImageUploadProgress(0);
    setDiscardConfirmOpen(false);
    setAlertState(EMPTY_ALERT);
    setLoading(false);
  }, [isOpen, releaseImagePreview]);

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const currentSnapshot = useMemo(
    () =>
      createSnapshot({
        formData,
        techStack,
        startMonth,
        startYear,
        endMonth,
        endYear,
        selectedImageFile,
      }),
    [
      formData,
      techStack,
      startMonth,
      startYear,
      endMonth,
      endYear,
      selectedImageFile,
    ]
  );

  const isDirty = initialSnapshot
    ? JSON.stringify(currentSnapshot) !== JSON.stringify(initialSnapshot)
    : false;

  const imagePosition = parseImagePosition(formData.imagePosition);

  const isUploading =
    loading &&
    (Boolean(selectedImageFile) || isDataUrlImage(formData.image)) &&
    imageUploadProgress < 100;

  /* ------------------------------------------------------------------------ */
  /* Form helpers                                                             */
  /* ------------------------------------------------------------------------ */

  const updateFormField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const showAlert = (title, message) => {
    setAlertState({
      open: true,
      title,
      message,
    });
  };

  const handleAddTech = (event) => {
    if (event.key !== "Enter" && event.key !== ",") return;

    event.preventDefault();

    const value = techInput.replace(/,/g, "").trim();

    if (!value) {
      setTechInput("");
      return;
    }

    const exists = techStack.some(
      (tech) => tech.trim().toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      setTechStack((current) => [...current, value]);
    }

    setTechInput("");
  };

  const removeTech = (index) => {
    setTechStack((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Image handling                                                           */
  /* ------------------------------------------------------------------------ */

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      validateImageFile(file);

      const previewUrl = URL.createObjectURL(file);

      releaseImagePreview();

      imagePreviewUrlRef.current = previewUrl;

      setSelectedImageFile(file);
      setImagePreviewUrl(previewUrl);
      setImageUploadProgress(0);
    } catch (error) {
      event.target.value = "";

      showAlert(
        "Image not selected",
        error?.message || "Please choose a valid image."
      );
    }
  };

  const removeSelectedImage = () => {
    releaseImagePreview();

    setSelectedImageFile(null);
    setImagePreviewUrl(formData.image || "");
    setImageUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateImagePosition = (axis, value) => {
    const nextValue = Math.min(100, Math.max(0, Number(value)));

    setFormData((current) => {
      const currentPosition = parseImagePosition(current.imagePosition);

      const nextX =
        axis === "x" ? nextValue : currentPosition.x;

      const nextY =
        axis === "y" ? nextValue : currentPosition.y;

      return {
        ...current,
        imagePosition: formatImagePosition(nextX, nextY),
      };
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Link handling                                                            */
  /* ------------------------------------------------------------------------ */

  const updateLink = (index, field, value) => {
    setFormData((current) => {
      const links = [...current.links];

      links[index] = {
        ...links[index],
        [field]: value,
      };

      return {
        ...current,
        links,
      };
    });
  };

  const addLink = () => {
    setFormData((current) => ({
      ...current,
      links: [
        ...current.links,
        {
          label: "",
          href: "",
          kind: "visit",
        },
      ],
    }));
  };

  const removeLink = (index) => {
    setFormData((current) => ({
      ...current,
      links: current.links.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* Close handling                                                           */
  /* ------------------------------------------------------------------------ */

  const requestClose = () => {
    if (loading) return;

    if (!isDirty) {
      onClose?.();
      return;
    }

    setDiscardConfirmOpen(true);
  };

  const confirmDiscard = () => {
    setDiscardConfirmOpen(false);
    onClose?.();
  };

  /* ------------------------------------------------------------------------ */
  /* Submit and validation                                                    */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const title = formData.title.trim();
    const subtitle = formData.subtitle.trim();

    if (!title || !subtitle) {
      showAlert(
        "Missing information",
        "Please enter both a title and a subtitle."
      );
      return;
    }

    const startValue = getMonthValue(startMonth, startYear);

    const endValue =
      endYear === "Present"
        ? Infinity
        : getMonthValue(endMonth, endYear);

    if (endValue < startValue) {
      showAlert(
        "Invalid duration",
        "The end date must be the same as or later than the start date."
      );
      return;
    }

    const linkError = validateLinks(formData.links);

    if (linkError) {
      showAlert("Check your links", linkError);
      return;
    }

    if (
      collectionName === "projects" &&
      techStack.some((tech) => !tech.trim())
    ) {
      showAlert(
        "Invalid tech stack",
        "Remove any empty technology entries before saving."
      );
      return;
    }

    setLoading(true);
    setImageUploadProgress(0);

    try {
      const duration =
        endYear === "Present"
          ? `${startMonth} ${startYear} - Present`
          : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

      const sortValue = startValue;

      let imageUrl = formData.image;

      if (selectedImageFile) {
        imageUrl = await uploadImage(selectedImageFile, {
          folder: `portfolio/${collectionName}/${data.id}`,
          onProgress: setImageUploadProgress,
        });
      } else if (isDataUrlImage(imageUrl)) {
        const legacyImageFile = dataUrlToFile(
          imageUrl,
          `${data.id || "image"}.jpg`
        );

        imageUrl = await uploadImage(legacyImageFile, {
          folder: `portfolio/${collectionName}/${data.id}`,
          onProgress: setImageUploadProgress,
        });
      }

      const payload = {
        ...formData,
        title,
        subtitle,
        description: formData.description.trim(),
        image: imageUrl,
        imagePosition: formData.imagePosition,
        links: normalizeLinks(formData.links).map((link) => ({
          ...link,
          label: link.label.trim(),
          href: link.href.trim(),
        })),
        duration,
        sortDate: sortValue,
        techStack:
          collectionName === "projects"
            ? techStack.map((tech) => tech.trim())
            : [],
      };

      await updatePortfolioItem(
        collectionName,
        data.id,
        payload
      );

      onUpdateSuccess?.(collectionName, {
        ...payload,
        id: data.id,
      });

      onClose?.();
    } catch (error) {
      showAlert(
        "Update failed",
        error?.message ||
        "Something went wrong while updating your portfolio item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center bg-[rgb(var(--color-ink-rgb)/0.75)] p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      {/* Alert dialog */}
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState(EMPTY_ALERT)}
      />

      {/* Discard confirmation */}
      <ConfirmModal
        isOpen={discardConfirmOpen}
        title="Discard unsaved changes?"
        message="Your changes have not been saved. Do you want to discard them?"
        danger
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onCancel={() => setDiscardConfirmOpen(false)}
        onConfirm={confirmDiscard}
      />

      {/* Main modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-portfolio-title"
        className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[6px_6px_0_var(--color-accent)] sm:shadow-[10px_10px_0_var(--color-accent)]"
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b-2 border-[var(--color-ink)] bg-[var(--color-panel)] px-4 py-4 text-[var(--color-paper-light)] sm:px-3 sm:py-3">
          <div className="min-w-0">
            

            <h2
              id="edit-portfolio-title"
              className="truncate font-display text-xl font-black uppercase tracking-tight sm:text-2xl"
            >
              Edit {collectionName}
            </h2>
          </div>

          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            aria-label="Close editor"
            className="flex size-10 shrink-0 items-center justify-center border-2 border-[var(--color-paper-light)] bg-[var(--color-accent)] text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-paper-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50"
          >
            <IoCloseOutline size={27} />
          </button>
        </header>

        {/* Form body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-7 lg:p-8">

            <div className="space-y-8">
              {/* Section 1: Basic information */}
              <section>
                <SectionHeading
                  number="01"
                  title="Basic information"
                  description="The title and details shown on your portfolio."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="portfolio-title">
                      Title *
                    </FieldLabel>

                    <input
                      id="portfolio-title"
                      required
                      maxLength={150}
                      autoComplete="off"
                      className={inputClass}
                      placeholder="e.g. SIBS"
                      value={formData.title}
                      onChange={(event) =>
                        updateFormField("title", event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="portfolio-subtitle">
                      Subtitle / Role *
                    </FieldLabel>

                    <input
                      id="portfolio-subtitle"
                      required
                      maxLength={150}
                      autoComplete="off"
                      className={inputClass}
                      placeholder="e.g. Full-Stack Web Application"
                      value={formData.subtitle}
                      onChange={(event) =>
                        updateFormField("subtitle", event.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="portfolio-description">
                      Description
                    </FieldLabel>

                    <textarea
                      id="portfolio-description"
                      rows={4}
                      maxLength={5000}
                      className={`${inputClass} resize-y leading-relaxed`}
                      placeholder="Describe this project, experience, or achievement..."
                      value={formData.description}
                      onChange={(event) =>
                        updateFormField(
                          "description",
                          event.target.value
                        )
                      }
                    />

                    <p className="mt-1 text-right text-[10px] text-[var(--color-muted)]">
                      {formData.description.length}/5000
                    </p>
                  </div>
                </div>
              </section>

              <div className="border-t-2 border-dashed border-[var(--color-ink)]/20" />

              {/* Section 2: Duration */}
              <section>
                <SectionHeading
                  number="02"
                  title="Duration"
                  description="Set the start and end dates for this entry."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                      Start date
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel htmlFor="portfolio-start-month">
                          Month
                        </FieldLabel>

                        <select
                          id="portfolio-start-month"
                          className={inputClass}
                          value={startMonth}
                          onChange={(event) =>
                            setStartMonth(event.target.value)
                          }
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <FieldLabel htmlFor="portfolio-start-year">
                          Year
                        </FieldLabel>

                        <select
                          id="portfolio-start-year"
                          className={inputClass}
                          value={startYear}
                          onChange={(event) =>
                            setStartYear(event.target.value)
                          }
                        >
                          {YEARS.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}

                          {!YEARS.includes(startYear) && (
                            <option value={startYear}>
                              {startYear}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em]">
                        End date
                      </p>

                      <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold">
                        <input
                          type="checkbox"
                          checked={endYear === "Present"}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setEndYear("Present");
                            } else {
                              setEndYear(startYear);
                              setEndMonth(startMonth);
                            }
                          }}
                          className="accent-[var(--color-accent)]"
                        />
                        Ongoing
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <FieldLabel htmlFor="portfolio-end-month">
                          Month
                        </FieldLabel>

                        <select
                          id="portfolio-end-month"
                          className={inputClass}
                          value={endMonth}
                          disabled={endYear === "Present"}
                          onChange={(event) =>
                            setEndMonth(event.target.value)
                          }
                        >
                          {MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <FieldLabel htmlFor="portfolio-end-year">
                          Year
                        </FieldLabel>

                        <select
                          id="portfolio-end-year"
                          className={inputClass}
                          value={endYear}
                          disabled={endYear === "Present"}
                          onChange={(event) =>
                            setEndYear(event.target.value)
                          }
                        >
                          {YEARS.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}

                          {!YEARS.includes(endYear) &&
                            endYear !== "Present" && (
                              <option value={endYear}>
                                {endYear}
                              </option>
                            )}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-l-4 border-[var(--color-accent)] bg-[var(--color-paper)] px-4 py-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    Preview
                  </span>

                  <span className="text-xs font-black">
                    {startMonth} {startYear} —{" "}
                    {endYear === "Present"
                      ? "Present"
                      : `${endMonth} ${endYear}`}
                  </span>
                </div>
              </section>

              {/* Section 3: Tech stack */}
              {collectionName === "projects" && (
                <>
                  <div className="border-t-2 border-dashed border-[var(--color-ink)]/20" />

                  <section>
                    <SectionHeading
                      number="03"
                      title="Tech stack"
                      description="Press Enter or comma to add a technology."
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id="portfolio-tech-stack"
                        className={`${inputClass} flex-1`}
                        placeholder="e.g. React, Firebase, Tailwind CSS"
                        value={techInput}
                        onChange={(event) =>
                          setTechInput(event.target.value)
                        }
                        onKeyDown={handleAddTech}
                      />

                      <button
                        type="button"
                        className={`${buttonClass} bg-[var(--color-paper)] hover:bg-[var(--color-accent)]`}
                        onClick={() => {
                          const value = techInput.trim();

                          if (!value) return;

                          const exists = techStack.some(
                            (tech) =>
                              tech.trim().toLowerCase() ===
                              value.toLowerCase()
                          );

                          if (!exists) {
                            setTechStack((current) => [
                              ...current,
                              value,
                            ]);
                          }

                          setTechInput("");
                        }}
                      >
                        Add technology
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {techStack.map((tech, index) => (
                        <span
                          key={`${tech}-${index}`}
                          className="inline-flex items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-2 text-xs font-bold shadow-[2px_2px_0_var(--color-ink)]"
                        >
                          {tech}

                          <button
                            type="button"
                            aria-label={`Remove ${tech}`}
                            onClick={() => removeTech(index)}
                            className="font-black text-[var(--color-danger)] hover:opacity-60"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {techStack.length === 0 && (
                        <p className="border-2 border-dashed border-[var(--color-ink)]/30 px-4 py-3 text-xs text-[var(--color-muted)]">
                          No technologies added yet.
                        </p>
                      )}
                    </div>
                  </section>
                </>
              )}

              <div className="border-t-2 border-dashed border-[var(--color-ink)]/20" />

              {/* Section 4: Links */}
              <section>
                <SectionHeading
                  number={collectionName === "projects" ? "04" : "03"}
                  title="Links"
                  description="Add GitHub repositories, live websites, or demos."
                />

                <div className="space-y-4">
                  {formData.links.map((link, index) => (
                    <div
                      key={index}
                      className="border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4 shadow-[3px_3px_0_var(--color-ink)]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                          Link {String(index + 1).padStart(2, "0")}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-danger)] underline underline-offset-4"
                        >
                          Remove link
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <FieldLabel htmlFor={`link-label-${index}`}>
                            Label
                          </FieldLabel>

                          <input
                            id={`link-label-${index}`}
                            className={inputClass}
                            placeholder="GitHub, Website, Demo..."
                            value={link.label}
                            onChange={(event) =>
                              updateLink(
                                index,
                                "label",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <FieldLabel htmlFor={`link-kind-${index}`}>
                            Link type
                          </FieldLabel>

                          <select
                            id={`link-kind-${index}`}
                            className={inputClass}
                            value={link.kind}
                            onChange={(event) =>
                              updateLink(
                                index,
                                "kind",
                                event.target.value
                              )
                            }
                          >
                            <option value="visit">Visit</option>
                            <option value="github">GitHub</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <FieldLabel htmlFor={`link-url-${index}`}>
                            URL
                          </FieldLabel>

                          <input
                            id={`link-url-${index}`}
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com"
                            value={link.href}
                            onChange={(event) =>
                              updateLink(
                                index,
                                "href",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addLink}
                    className={`${buttonClass} w-full border-dashed bg-[var(--color-paper)] hover:bg-[var(--color-accent)]`}
                  >
                    <span className="text-lg leading-none">+</span>
                    Add another link
                  </button>

                  {formData.links.length === 0 && (
                    <p className="text-xs text-[var(--color-muted)]">
                      No links added. This section is optional.
                    </p>
                  )}
                </div>
              </section>

              <div className="border-t-2 border-dashed border-[var(--color-ink)]/20" />

              {/* Section 5: Image */}
              <section>
                <SectionHeading
                  number={collectionName === "projects" ? "05" : "04"}
                  title="Cover image"
                  description="Upload an image and adjust which area appears in the preview."
                />

                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  {/* Preview */}
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="portfolio-image">
                        Image preview
                      </FieldLabel>

                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        {selectedImageFile ? "New image" : "Current image"}
                      </span>
                    </div>

                    <div className="overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-panel)] shadow-[4px_4px_0_var(--color-ink)]">
                      {imagePreviewUrl || formData.image ? (
                        <img
                          src={imagePreviewUrl || formData.image}
                          alt="Portfolio cover preview"
                          className="h-52 w-full object-cover sm:h-64"
                          style={{
                            objectPosition: formData.imagePosition,
                          }}
                        />
                      ) : (
                        <div className="flex h-52 flex-col items-center justify-center gap-3 bg-[var(--color-paper)] text-[var(--color-muted)] sm:h-64">
                          <span className="text-4xl">＋</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                            No image selected
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <label
                        htmlFor="portfolio-image"
                        className={`${buttonClass} cursor-pointer bg-[var(--color-accent)] hover:-translate-y-0.5`}
                      >
                        {selectedImageFile ? "Change image" : "Choose image"}
                      </label>

                      {selectedImageFile && (
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className={`${buttonClass} bg-[var(--color-paper)] hover:bg-[var(--color-danger)] hover:text-white`}
                        >
                          Undo selection
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      id="portfolio-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImage}
                      disabled={loading}
                      className="sr-only"
                    />

                    <p className="mt-3 text-[10px] leading-relaxed text-[var(--color-muted)]">
                      Supported formats: JPG, PNG, and WebP. Your existing
                      image remains unchanged unless you save a replacement.
                    </p>

                    {selectedImageFile && (
                      <p className="mt-2 break-all text-[10px] font-bold">
                        Selected: {selectedImageFile.name}
                      </p>
                    )}

                    {isUploading && (
                      <div
                        className="mt-4"
                        role="status"
                        aria-live="polite"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.1em]">
                          <span>Uploading image</span>
                          <span>{imageUploadProgress}%</span>
                        </div>

                        <div
                          className="h-3 overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-paper)]"
                          role="progressbar"
                          aria-valuenow={imageUploadProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full bg-[var(--color-accent)] transition-[width] duration-200"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, imageUploadProgress)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Focus controls */}
                  <div className="space-y-5 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em]">
                        Image focus
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed text-[var(--color-muted)]">
                        Adjust the crop position without editing the original
                        image.
                      </p>
                    </div>

                    <div>
                      <FieldLabel>Quick positions</FieldLabel>

                      <div className="grid grid-cols-2 gap-2">
                        {FOCAL_PRESETS.map((preset) => {
                          const active =
                            formData.imagePosition === preset.value;

                          return (
                            <button
                              key={preset.label}
                              type="button"
                              aria-pressed={active}
                              onClick={() =>
                                updateFormField(
                                  "imagePosition",
                                  preset.value
                                )
                              }
                              className={`border-2 border-[var(--color-ink)] px-3 py-3 text-[10px] font-black uppercase tracking-[0.1em] transition ${active
                                  ? "bg-[var(--color-accent)] shadow-[3px_3px_0_var(--color-ink)]"
                                  : "bg-[var(--color-paper-light)] hover:bg-[var(--color-accent)]/50"
                                }`}
                            >
                              {active ? "✓ " : ""}
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <FieldLabel>Horizontal position</FieldLabel>

                        <span className="text-[10px] font-black tabular-nums">
                          {imagePosition.x}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        aria-label="Horizontal image position"
                        value={imagePosition.x}
                        onChange={(event) =>
                          updateImagePosition("x", event.target.value)
                        }
                        className="w-full cursor-pointer accent-[var(--color-accent)]"
                      />

                      <div className="mt-1 flex justify-between text-[9px] font-bold uppercase text-[var(--color-muted)]">
                        <span>Left</span>
                        <span>Right</span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <FieldLabel>Vertical position</FieldLabel>

                        <span className="text-[10px] font-black tabular-nums">
                          {imagePosition.y}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        aria-label="Vertical image position"
                        value={imagePosition.y}
                        onChange={(event) =>
                          updateImagePosition("y", event.target.value)
                        }
                        className="w-full cursor-pointer accent-[var(--color-accent)]"
                      />

                      <div className="mt-1 flex justify-between text-[9px] font-bold uppercase text-[var(--color-muted)]">
                        <span>Top</span>
                        <span>Bottom</span>
                      </div>
                    </div>

                    <div className="border-t-2 border-dashed border-[var(--color-ink)]/25 pt-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        Current position
                      </p>

                      <p className="mt-1 break-all text-sm font-black">
                        {formData.imagePosition}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          updateFormField(
                            "imagePosition",
                            DEFAULT_IMAGE_POSITION
                          )
                        }
                        className="mt-3 text-[10px] font-black uppercase tracking-[0.1em] underline decoration-2 underline-offset-4 hover:text-[var(--color-accent)]"
                      >
                        Reset position
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer actions */}
          <footer className="shrink-0 border-t-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-4 sm:px-3 sm:py-3">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-[10px] font-bold text-[var(--color-paper-light)]/80">
                <span
                  className={`size-2 shrink-0 rounded-full ${isDirty
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-paper-light)]/50"
                    }`}
                />

                <span>
                  {isDirty
                    ? "Unsaved changes"
                    : "Everything is up to date"}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={loading}
                  onClick={requestClose}
                  className={`${buttonClass} border-[var(--color-paper-light)] bg-transparent text-[var(--color-paper-light)] hover:bg-[var(--color-paper-light)] hover:text-[var(--color-ink)]`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !isDirty}
                  className={`${buttonClass} min-w-44 bg-[var(--color-accent)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-paper-light)] hover:translate-y-0.5 hover:shadow-none`}
                >
                  {loading ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-[var(--color-ink)] border-t-transparent" />

                      {isUploading
                        ? `Uploading ${imageUploadProgress}%`
                        : "Saving changes..."}
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Update portfolio
                    </>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default EditPortfolioModal;