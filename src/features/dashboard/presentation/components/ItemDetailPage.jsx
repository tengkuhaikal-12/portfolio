import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import EditPortfolioModal from "@/features/dashboard/presentation/components/EditPortfolioModal";
import DefaultThumbnail from "@/features/dashboard/presentation/components/cards/DefaultThumbnail";
import Lightbox from "@/shared/components/Lightbox";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  IoAddOutline,
  IoArrowBackOutline,
  IoCalendarOutline,
  IoLinkOutline,
  IoLocationOutline,
  IoOpenOutline,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import {
  appendGalleryImages,
  deletePortfolioEntry,
  fetchPortfolioItem,
  saveGallery as persistGallery,
} from "@/features/dashboard/data/portfolioService";

const ItemDetailPage = ({ collectionName, kindLabel, descriptionFormat = "richText" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState("");
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [removePhotoConfirm, setRemovePhotoConfirm] = useState({ open: false, src: "" });
  const [deleteItemConfirmOpen, setDeleteItemConfirmOpen] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteItemError, setDeleteItemError] = useState("");

  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const snap = await fetchPortfolioItem(collectionName, id);
        if (!isMounted) return;
        if (!snap) {
          setNotFound(true);
          setItem(null);
          return;
        }
        setItem(snap);
      } catch (e) {
        console.error("Failed to load detail:", e);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [collectionName, id]);

  const galleryItems = useMemo(() => {
    const raw = item?.gallery || item?.images || item?.imageGallery || [];
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
      .map((g) => {
        if (!g) return null;
        if (typeof g === "string") return { src: g };
        if (typeof g === "object") {
          const src = g.src || g.url || g.image || "";
          if (!src) return null;
          return { src, href: g.href || g.link || g.projectUrl || "" };
        }
        return null;
      })
      .filter(Boolean);

    const seen = new Set();
    const unique = [];
    normalized.forEach((g) => {
      if (seen.has(g.src)) return;
      seen.add(g.src);
      unique.push(g);
    });

    const withoutHero = item?.image ? unique.filter((g) => g.src !== item.image) : unique;
    return withoutHero;
  }, [item]);

  const actions = useMemo(() => {
    const links = [];

    if (item?.link)
      links.push({
        kind: "visit",
        label: "Website",
        href: item.link,
      });

    if (item?.url)
      links.push({
        kind: "visit",
        label: "Visit",
        href: item.url,
      });

    if (item?.liveUrl)
      links.push({
        kind: "visit",
        label: "Live Demo",
        href: item.liveUrl,
      });

    if (item?.github)
      links.push({
        kind: "github",
        label: "GitHub",
        href: item.github,
      });

    if (item?.repoUrl)
      links.push({
        kind: "github",
        label: "Repository",
        href: item.repoUrl,
      });

    if (Array.isArray(item?.links)) {
      item.links.forEach((l) => {
        const href = cleanActionHref(l?.href);
        if (!href) return;

        links.push({
          kind: l.kind || "visit",
          label: l.label || "Open",
          href,
        });
      });
    }

    const dedup = new Map();

    links.forEach((l) => {
      const href = cleanActionHref(l.href);
      if (!href) return;
      dedup.set(href, {
        ...l,
        href,
        label: String(l.label || "Open").trim() || "Open",
      });
    });

    return Array.from(dedup.values()).slice(0, 4);
  }, [item]);

  const formattedDescription = useMemo(() => {
    const text = (item?.description || "").toString();
    return descriptionFormat === "markdown" ? normalizeMarkdown(text) : normalizeRichText(text);
  }, [descriptionFormat, item]);

  const openLightbox = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const handleUpdateSuccess = (_, updatedItem) => setItem((prev) => ({ ...(prev || {}), ...updatedItem }));

  const onPickGalleryFiles = () => {
    if (!isAdmin) return;
    galleryFileInputRef.current?.click();
  };

  const onGalleryFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []).filter(Boolean);
    e.target.value = "";
    if (!files.length || !isAdmin) return;

    setGalleryUploadError("");
    setIsUploadingGallery(true);
    try {
      const uploaded = await appendGalleryImages(collectionName, id, files);

      if (uploaded.length) {
        setItem((prev) => {
          const prevItem = prev || {};
          const existingRaw = Array.isArray(prevItem.gallery) ? prevItem.gallery : [];
          const existing = existingRaw
            .map((g) => {
              if (!g) return null;
              if (typeof g === "string") return { src: g };
              if (typeof g === "object") {
                const src = g.src || g.url || g.image || "";
                if (!src) return null;
                return { src, href: g.href || g.link || g.projectUrl || "" };
              }
              return null;
            })
            .filter(Boolean);

          const seen = new Set();
          const merged = [];
          [...existing, ...uploaded].forEach((g) => {
            if (seen.has(g.src)) return;
            seen.add(g.src);
            merged.push(g);
          });
          return { ...prevItem, gallery: merged };
        });
      }
    } catch (err) {
      console.error("Gallery upload failed:", err);
      setGalleryUploadError(err?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const saveGallery = async (nextGallery) => {
    if (!isAdmin) return;
    setGalleryUploadError("");
    setIsSavingGallery(true);
    try {
      await persistGallery(collectionName, id, nextGallery);
      setItem((prev) => ({ ...(prev || {}), gallery: nextGallery }));
    } catch (err) {
      console.error("Gallery update failed:", err);
      setGalleryUploadError("Update failed. Please try again.");
    } finally {
      setIsSavingGallery(false);
    }
  };

  const onEditGalleryLink = async (src) => {
    if (!isAdmin) return;
    const current = galleryItems.find((g) => g.src === src);
    const nextHref = window.prompt("Project link (optional). Use /projects/<id> or https://...", current?.href || "") ?? null;
    if (nextHref === null) return;
    const cleaned = nextHref.trim();
    const nextGallery = galleryItems.map((g) => (g.src === src ? { ...g, href: cleaned } : g));
    await saveGallery(nextGallery);
  };

  const onRemoveGalleryItem = async (src) => {
    if (!isAdmin) return;
    setRemovePhotoConfirm({ open: true, src });
  };

  const performRemoveGalleryItem = async (src) => {
    const nextGallery = galleryItems.filter((g) => g.src !== src);
    await saveGallery(nextGallery);
  };

  const requestDeleteItem = () => {
    if (!isAdmin || isDeletingItem) return;
    setDeleteItemError("");
    setDeleteItemConfirmOpen(true);
  };

  const performDeleteItem = async () => {
    if (!isAdmin || isDeletingItem) return;

    setDeleteItemError("");
    setIsDeletingItem(true);
    try {
      await deletePortfolioEntry(collectionName, id);
      setDeleteItemConfirmOpen(false);
      navigate(`/${collectionName}`, { replace: true });
    } catch (err) {
      console.error("Delete item failed:", err);
      setDeleteItemError(err?.message || `Unable to delete this ${kindLabel.toLowerCase()}. Please try again.`);
    } finally {
      setIsDeletingItem(false);
    }
  };

  const openGalleryLink = (href) => {
    if (!href) return;
    if (/^https?:\/\//i.test(href)) window.open(href, "_blank", "noreferrer");
    else navigate(href);
  };

  if (loading) return <DetailSkeleton />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[var(--color-ink)]">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-32">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex cursor-pointer items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            <IoArrowBackOutline /> Back
          </button>
          <div className="mt-10 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-8 shadow-[8px_8px_0_var(--color-ink)]">
            <p className="font-display text-3xl font-black uppercase tracking-tight">Not found</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">This {kindLabel.toLowerCase()} does not exist (or was removed).</p>
            <Link to="/" className="mt-7 inline-flex items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]">
              Go home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = item?.title || kindLabel;
  const subtitle = item?.subtitle || "";
  const duration = item?.duration || item?.date || "";
  const location = item?.location || "";
  const tags = collectionName === "projects" ? item?.techStack || item?.tags || [] : item?.tags || [];
  const defaultThumbnailIndex = collectionName === "projects" ? 0 : collectionName === "experience" ? 1 : 2;
  const hasLinkActions = actions.length > 0;
  const hasSidebar = hasLinkActions || isAdmin;

  return (
    <div className="min-h-screen bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[var(--color-ink)] selection:bg-[var(--color-accent)]">
      <Navbar />

      {/* HERO */}
      <section className="border-b-2 border-[var(--color-ink)] bg-[var(--color-panel)] px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
        <div className="relative mx-auto h-[44vh] w-full max-w-7xl overflow-hidden border-2 border-[var(--color-ink)] shadow-[8px_8px_0_var(--color-accent)] md:h-[58vh]">
          {item?.image ? (
            <img
              src={item.image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 hover:scale-[1.02] hover:grayscale-0"
              style={{ objectPosition: item.imagePosition || "50% 50%" }}
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0">
              <DefaultThumbnail index={defaultThumbnailIndex} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-ink-rgb)/0.85)] via-[rgb(var(--color-ink-rgb)/0.15)] to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--color-white-rgb)/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-white-rgb)/0.05)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute left-5 top-5 border-2 border-[var(--color-ink)] bg-[var(--color-accent)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_var(--color-ink)]">
            {kindLabel}
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8 sm:pb-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex cursor-pointer items-center gap-2 border-2 border-[var(--color-paper-light)] bg-[var(--color-ink)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-paper-light)] shadow-[3px_3px_0_var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <IoArrowBackOutline /> Back
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN INFO */}
      <section className="relative z-10 mx-auto mt-10 max-w-7xl px-4 sm:px-6 md:mt-14">
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-12">
          <div className={`overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] shadow-[6px_6px_0_var(--color-ink)] ${hasSidebar ? "md:col-span-8" : "md:col-span-12"}`}>
            <div className="p-6 md:p-9">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">{kindLabel} / Overview</p>
              <h1 className="break-words font-display text-[clamp(2.8rem,7vw,5.5rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]">{title}</h1>
              {subtitle ? <p className="mt-5 border-l-4 border-[var(--color-accent)] pl-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-muted)]">{subtitle}</p> : null}
              {item?.shortDescription ? (
                <p className="mt-5 text-sm leading-7 text-[var(--color-muted)] md:text-base">{item.shortDescription}</p>
              ) : null}

              <div className="mt-7 grid grid-cols-1 gap-4 border-t-2 border-[var(--color-ink)] pt-6 sm:grid-cols-2">
                {duration ? (
                  <MetaRow icon={<IoCalendarOutline />} label="Date" value={duration} />
                ) : null}
                {location ? <MetaRow icon={<IoLocationOutline />} label="Location" value={location} /> : null}
                {item?.status ? <MetaRow label="Status" value={item.status} /> : null}
              </div>

              {Array.isArray(tags) && tags.length ? (
                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    Tech stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {hasSidebar ? (
            <div className="space-y-4 self-start md:col-span-4">
              {hasLinkActions ? (
                <div className="border-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-6 text-[var(--color-paper-light)] shadow-[6px_6px_0_var(--color-accent)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    Actions
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {actions.map((action) => {
                      const isGithub = action.kind === "github";

                      return (
                        <a
                          key={action.href}
                          href={formatActionHref(action.href)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-between gap-3 border-2 border-[var(--color-border-muted)] bg-[var(--color-panel-soft)] px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {isGithub ? (
                              <FaGithub className="shrink-0 text-lg" />
                            ) : (
                              <IoOpenOutline className="shrink-0 text-lg" />
                            )}

                            <div className="min-w-0">
                              <p className="truncate">
                                {action.label}
                              </p>

                              <p className="truncate text-[10px] font-normal text-[var(--color-muted-light)]">
                                {action.href}
                              </p>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {isAdmin ? (
                <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-6 shadow-[6px_6px_0_rgb(var(--color-ink-rgb)/0.18)]">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    Admin
                  </p>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    <IoPencilOutline /> Edit
                  </button>

                  <button
                    onClick={requestDeleteItem}
                    disabled={isDeletingItem}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-danger)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-paper-light)] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60"
                  >
                    <IoTrashOutline /> {isDeletingItem ? "Deleting..." : "Delete"}
                  </button>

                  {deleteItemError ? (
                    <p className="mt-3 border-l-4 border-[var(--color-danger)] pl-3 text-xs font-black leading-5 text-[var(--color-danger)]">
                      {deleteItemError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* DETAILS */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 md:mt-16">
        <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-6 shadow-[6px_6px_0_rgb(var(--color-ink-rgb)/0.18)] md:p-10">
          <div className="flex items-end gap-4 border-b-2 border-[var(--color-ink)] pb-5">
            <span className="font-serif text-2xl font-black italic text-[var(--color-accent)]">01</span>
            <h2 className="font-display text-4xl font-black uppercase leading-none tracking-[-0.05em] md:text-6xl">Details</h2>
          </div>
          <div className="mt-6 space-y-6">
            <RichBlocks blocks={formattedDescription} />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {galleryItems.length || isAdmin ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 pb-20 sm:px-6 md:mt-16">
          <div className="border-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-6 text-[var(--color-paper-light)] shadow-[6px_6px_0_var(--color-accent)] md:p-10">
            <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--color-border-muted)] pb-5">
              <div>
                <div className="flex items-end gap-4">
                  <span className="font-serif text-2xl font-black italic text-[var(--color-accent)]">02</span>
                  <h2 className="font-display text-4xl font-black uppercase leading-none tracking-[-0.05em] md:text-6xl">Gallery</h2>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-muted-light)]">{galleryItems.length} photos</p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
              {isAdmin ? (
                <>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onGalleryFilesSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={onPickGalleryFiles}
                    disabled={isUploadingGallery || isSavingGallery}
                    className="group relative grid aspect-square place-items-center overflow-hidden border-2 border-[var(--color-border-muted)] bg-[var(--color-panel-soft)] transition hover:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-70"
                    aria-label="Upload gallery images"
                    title="Upload gallery images"
                  >
                    <div className="grid place-items-center text-center px-4">
                      <div className="mb-3 grid h-12 w-12 place-items-center border-2 border-[var(--color-paper-light)] bg-[var(--color-accent)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-paper-light)]">
                        <IoAddOutline size={22} />
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest">
                        {isUploadingGallery ? "Uploading..." : isSavingGallery ? "Saving..." : "Add photos"}
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--color-muted-light)]">PNG/JPG/WebP</div>
                    </div>
                    <div className="absolute inset-0 bg-[rgb(var(--color-ink-rgb)/0)] transition group-hover:bg-[rgb(var(--color-ink-rgb)/0.1)]" />
                  </button>
                </>
              ) : null}
              {galleryItems.map((g, idx) => (
                <div key={g.src} className="group relative aspect-square overflow-hidden border-2 border-[var(--color-border-muted)] transition hover:-translate-y-1 hover:border-[var(--color-accent)]">
                  <button
                    onClick={() => openLightbox(idx)}
                    className="absolute inset-0 h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    aria-label={`Open image ${idx + 1}`}
                    type="button"
                  >
                    <img
                      src={g.src}
                      alt={`${title} ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[rgb(var(--color-ink-rgb)/0)] transition group-hover:bg-[rgb(var(--color-ink-rgb)/0.25)]" />
                    <div className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] opacity-0 shadow-[2px_2px_0_var(--color-accent)] transition group-hover:opacity-100">
                      <IoOpenOutline />
                    </div>
                  </button>

                  {g.href ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openGalleryLink(g.href);
                      }}
                      className="absolute left-2 top-2 grid h-9 w-9 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] opacity-0 shadow-[2px_2px_0_var(--color-accent)] transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      aria-label="Open project link"
                      title="Open project link"
                    >
                      <IoLinkOutline />
                    </button>
                  ) : null}

                  {isAdmin ? (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditGalleryLink(g.src);
                        }}
                        disabled={isSavingGallery}
                        className="grid h-9 w-9 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[2px_2px_0_var(--color-accent)] disabled:opacity-60"
                        aria-label="Edit project link"
                        title="Edit project link"
                      >
                        <IoPencilOutline />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveGalleryItem(g.src);
                        }}
                        disabled={isSavingGallery}
                        className="grid h-9 w-9 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[2px_2px_0_var(--color-accent)] disabled:opacity-60"
                        aria-label="Remove photo"
                        title="Remove photo"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {galleryUploadError ? <p className="mt-4 border-l-4 border-[var(--color-danger)] pl-3 text-sm font-black text-[var(--color-danger-light)]">{galleryUploadError}</p> : null}
            {!galleryItems.length && !isUploadingGallery ? (
              <p className="mt-4 text-sm text-[var(--color-muted-light)]">No photos yet.</p>
            ) : null}
          </div>
        </section>
      ) : (
        <div className="pb-16" />
      )}

      <Footer />

      <ConfirmModal
        isOpen={removePhotoConfirm.open}
        title="Remove photo?"
        message="This removes the photo from the gallery (it won't delete the file from storage)."
        danger
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onCancel={() => setRemovePhotoConfirm({ open: false, src: "" })}
        onConfirm={async () => {
          const src = removePhotoConfirm.src;
          setRemovePhotoConfirm({ open: false, src: "" });
          await performRemoveGalleryItem(src);
        }}
      />

      <ConfirmModal
        isOpen={deleteItemConfirmOpen}
        title={`Delete ${kindLabel.toLowerCase()}?`}
        message={`This permanently removes "${title}" from ${collectionName}.`}
        danger
        confirmLabel={isDeletingItem ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onCancel={() => {
          if (!isDeletingItem) setDeleteItemConfirmOpen(false);
        }}
        onConfirm={performDeleteItem}
      />

      <EditPortfolioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={item}
        collectionName={collectionName}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <Lightbox
        isOpen={selectedImageIndex !== null}
        images={galleryItems}
        startIndex={selectedImageIndex ?? 0}
        onClose={closeLightbox}
      />
    </div>
  );
};

const MetaRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-4">
    <div className="mt-[2px] text-[var(--color-accent)]">{icon}</div>

    <div>
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {label}
      </div>

      <div className="mt-1 text-sm font-black">
        {value} {" "}{value?.toLowerCase().includes("present") && (
          <p className="mt-1 text-xs text-[var(--color-accent)]">
            In progress
          </p>
        )}
      </div>
    </div>
  </div>
);

function cleanActionHref(href) {
  const cleaned = String(href || "").trim();
  const lower = cleaned.toLowerCase();
  const placeholder = lower.replace(/[._-]+/g, " ").replace(/\s+/g, " ");
  const emptyValues = new Set(["#", "-", "n/a", "na", "none", "null", "undefined", "no link", "no links", "no links available"]);

  if (!cleaned || emptyValues.has(placeholder) || /^https?:\/\/?$/i.test(cleaned)) {
    return "";
  }

  return cleaned;
}

function formatActionHref(href) {
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) {
    return href;
  }

  return `https://${href}`;
}

function normalizeMarkdown(text) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const language = trimmed.replace(/^```/, "").trim();
      const codeLines = [];
      i += 1;

      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i += 1;
      }

      if (i < lines.length) i += 1;
      blocks.push({ type: "code", language, text: codeLines.join("\n") });
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      i += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines = [];

      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }

      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];

      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }

      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];

      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }

      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isMarkdownBlockStart(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }

    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
    } else {
      i += 1;
    }
  }

  if (!blocks.length) {
    return [{ type: "p", text: "No description provided yet." }];
  }
  return blocks;
}

function isMarkdownBlockStart(line) {
  const trimmed = line.trim();
  return (
    /^```/.test(trimmed) ||
    /^(#{1,6})\s+/.test(trimmed) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed)
  );
}

function normalizeRichText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length);

  const blocks = [];
  let i = 0;

  const takeParagraph = () => {
    const parts = [];
    while (i < lines.length && !isBullet(lines[i]) && !isSectionHeader(lines[i])) {
      parts.push(lines[i].trim());
      i += 1;
    }
    if (parts.length) blocks.push({ type: "p", text: parts.join(" ") });
  };

  const takeList = () => {
    const items = [];
    while (i < lines.length && isBullet(lines[i])) {
      items.push(lines[i].replace(/^[-*]\s+/, "").trim());
      i += 1;
    }
    if (items.length) blocks.push({ type: "ul", items });
  };

  while (i < lines.length) {
    if (isSectionHeader(lines[i])) {
      const { title, body } = parseHeaderLine(lines[i]);
      i += 1;
      const bodyLines = [];
      while (i < lines.length && !isSectionHeader(lines[i])) {
        bodyLines.push(lines[i]);
        i += 1;
      }
      const bodyText = body || bodyLines.join("\n");
      blocks.push({ type: "section", title, blocks: normalizeRichText(bodyText) });
      continue;
    }
    if (isBullet(lines[i])) {
      takeList();
      continue;
    }
    takeParagraph();
  }

  if (!blocks.length) {
    return [{ type: "p", text: "No description provided yet." }];
  }
  return blocks;
}

function isBullet(line) {
  return /^[-*]\s+/.test(line.trim());
}

function isSectionHeader(line) {
  return /^(problem|solution|outcome|challenges|highlights)\s*:/i.test(line.trim());
}

function parseHeaderLine(line) {
  const m = line.trim().match(/^([^:]+)\s*:\s*(.*)$/);
  return { title: (m?.[1] || "Section").trim(), body: (m?.[2] || "").trim() };
}

const RichBlocks = ({ blocks }) => {
  return blocks.map((b, idx) => {
    if (b.type === "heading") {
      const headingClassName =
        b.level <= 2
          ? "font-display text-2xl font-black uppercase leading-tight text-[var(--color-ink)] md:text-3xl"
          : "text-lg font-black uppercase leading-tight tracking-[0.08em] text-[var(--color-ink)] md:text-xl";

      return (
        <h3 key={idx} className={headingClassName}>
          <InlineMarkdown text={b.text} />
        </h3>
      );
    }
    if (b.type === "p") {
      return (
        <p key={idx} className="text-sm leading-7 text-[var(--color-muted)] md:text-base">
          <InlineMarkdown text={b.text} />
        </p>
      );
    }
    if (b.type === "ul") {
      return (
        <ul key={idx} className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-muted)] md:text-base">
          {b.items.map((it, itemIndex) => (
            <li key={`${it}-${itemIndex}`}>
              <InlineMarkdown text={it} />
            </li>
          ))}
        </ul>
      );
    }
    if (b.type === "ol") {
      return (
        <ol key={idx} className="list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-muted)] md:text-base">
          {b.items.map((it, itemIndex) => (
            <li key={`${it}-${itemIndex}`}>
              <InlineMarkdown text={it} />
            </li>
          ))}
        </ol>
      );
    }
    if (b.type === "blockquote") {
      return (
        <blockquote key={idx} className="border-l-4 border-[var(--color-accent)] bg-[var(--color-paper)] py-3 pl-4 pr-3 text-sm font-bold leading-7 text-[var(--color-muted)] md:text-base">
          <InlineMarkdown text={b.text} />
        </blockquote>
      );
    }
    if (b.type === "code") {
      return (
        <pre key={idx} className="overflow-x-auto border-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-4 text-xs leading-6 text-[var(--color-paper-light)] shadow-[3px_3px_0_rgb(var(--color-ink-rgb)/0.18)]">
          <code>{b.text}</code>
        </pre>
      );
    }
    if (b.type === "hr") {
      return <hr key={idx} className="border-t-2 border-[var(--color-ink)]" />;
    }
    if (b.type === "section") {
      return (
        <div key={idx} className="border-2 border-[var(--color-ink)] bg-[var(--color-paper)] p-5 shadow-[3px_3px_0_rgb(var(--color-ink-rgb)/0.18)] md:p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-accent)]">{b.title}</div>
          <div className="mt-3 space-y-4">
            <RichBlocks blocks={b.blocks} />
          </div>
        </div>
      );
    }
    return null;
  });
};

const InlineMarkdown = ({ text }) => {
  const parts = String(text || "").split(/(\[[^\]\n]+\]\([^)]+\)|\*\*[^*\n]+?\*\*|`[^`\n]+?`|\*[^*\n]+?\*)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    const link = part.match(/^\[([^\]\n]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeMarkdownHref(link[2]);
      const isExternal = /^https?:\/\//i.test(href);

      return (
        <a
          key={`${part}-${index}`}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="font-black text-[var(--color-ink)] underline decoration-[var(--color-accent)] decoration-2 underline-offset-4 hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {link[1]}
        </a>
      );
    }

    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${part}-${index}`} className="font-black text-[var(--color-ink)]">{part.slice(2, -2)}</strong>;
    }

    if (/^`[^`]+`$/.test(part)) {
      return <code key={`${part}-${index}`} className="border border-[var(--color-ink)] bg-[var(--color-paper)] px-1 py-0.5 text-[0.92em] font-black text-[var(--color-ink)]">{part.slice(1, -1)}</code>;
    }

    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={`${part}-${index}`} className="font-semibold text-[var(--color-ink)]">{part.slice(1, -1)}</em>;
    }

    return part;
  });
};

function safeMarkdownHref(href) {
  const cleaned = String(href || "").trim().replace(/^<|>$/g, "");

  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(cleaned)) {
    return cleaned;
  }

  return "#";
}

export default ItemDetailPage;

const DetailSkeleton = () => (
  <div className="min-h-screen bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px)] [background-size:32px_32px] font-body text-[var(--color-ink)]">
    <Navbar />
    <div className="pt-24">
      <div className="relative h-[44vh] w-full animate-pulse overflow-hidden bg-[var(--color-panel-light)] md:h-[54vh]" />
    </div>
    <div className="relative z-10 mx-auto mt-8 max-w-6xl px-6 md:mt-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-8 shadow-[6px_6px_0_var(--color-ink)] md:col-span-8">
          <div className="h-6 w-2/3 animate-pulse bg-[var(--color-paper-muted)]" />
          <div className="mt-4 h-4 w-full animate-pulse bg-[var(--color-paper-muted)]" />
          <div className="mt-2 h-4 w-5/6 animate-pulse bg-[var(--color-paper-muted)]" />
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-10 animate-pulse bg-[var(--color-paper-muted)]" />
            <div className="h-10 animate-pulse bg-[var(--color-paper-muted)]" />
            <div className="h-10 animate-pulse bg-[var(--color-paper-muted)]" />
            <div className="h-10 animate-pulse bg-[var(--color-paper-muted)]" />
          </div>
        </div>
        <div className="space-y-4 md:col-span-4">
          <div className="border-2 border-[var(--color-ink)] bg-[var(--color-panel)] p-6 shadow-[6px_6px_0_var(--color-accent)]">
            <div className="h-4 w-24 animate-pulse bg-[var(--color-panel-muted)]" />
            <div className="mt-4 space-y-2">
              <div className="h-10 animate-pulse bg-[var(--color-panel-muted)]" />
              <div className="h-10 animate-pulse bg-[var(--color-panel-muted)]" />
              <div className="h-10 animate-pulse bg-[var(--color-panel-muted)]" />
            </div>
          </div>
          <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-6">
            <div className="h-4 w-28 animate-pulse bg-[var(--color-paper-muted)]" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse bg-[var(--color-paper-muted)]" />
              <div className="h-4 w-11/12 animate-pulse bg-[var(--color-paper-muted)]" />
              <div className="h-4 w-10/12 animate-pulse bg-[var(--color-paper-muted)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="mx-auto mt-10 max-w-6xl px-6 pb-16">
      <div className="border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-10">
        <div className="h-6 w-36 animate-pulse bg-[var(--color-paper-muted)]" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse bg-[var(--color-paper-muted)]" />
          <div className="h-4 w-11/12 animate-pulse bg-[var(--color-paper-muted)]" />
          <div className="h-4 w-10/12 animate-pulse bg-[var(--color-paper-muted)]" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
