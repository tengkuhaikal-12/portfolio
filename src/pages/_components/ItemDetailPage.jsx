import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Footer";
import EditModal from "../../component/EditModal";
import Lightbox from "../../component/Lightbox";
import ConfirmModal from "../../component/ConfirmModal";
import { useAuth } from "../../auth/useAuth";
import { db, storage } from "../../firebase/firebase";
import { FirebaseError } from "firebase/app";
import { arrayUnion, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
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

const ItemDetailPage = ({ collectionName, kindLabel }) => {
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

  const heroRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const snap = await getDoc(doc(db, collectionName, id));
        if (!isMounted) return;
        if (!snap.exists()) {
          setNotFound(true);
          setItem(null);
          return;
        }
        setItem({ id: snap.id, ...snap.data() });
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

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const scale = Math.min(1.08, 1 + y / 2000);
      el.style.transform = `scale(${scale})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    if (item?.url) links.push({ kind: "visit", label: "Visit", href: item.url });
    if (item?.liveUrl) links.push({ kind: "visit", label: "Visit", href: item.liveUrl });
    if (item?.github) links.push({ kind: "github", label: "GitHub", href: item.github });
    if (item?.repoUrl) links.push({ kind: "github", label: "GitHub", href: item.repoUrl });
    if (Array.isArray(item?.links)) {
      item.links.forEach((l) => {
        if (!l?.href) return;
        links.push({ kind: l.kind || "visit", label: l.label || "Open", href: l.href });
      });
    }
    const dedup = new Map();
    links.forEach((l) => dedup.set(l.href, l));
    return Array.from(dedup.values()).slice(0, 4);
  }, [item]);

  const formattedDescription = useMemo(() => {
    const text = (item?.description || "").toString();
    return normalizeRichText(text);
  }, [item]);

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
      const uploaded = [];
      for (const file of files) {
        const safeName = (file.name || "image").replace(/[^\w.-]+/g, "_");
        const path = `${collectionName}/${id}/gallery/${Date.now()}_${safeName}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploaded.push({ src: url });
      }

      if (uploaded.length) {
        await updateDoc(doc(db, collectionName, id), {
          gallery: arrayUnion(...uploaded),
          updatedAt: serverTimestamp(),
        });

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
      const message =
        err instanceof FirebaseError
          ? (() => {
              if (err.code === "storage/unauthorized") {
                return "Upload blocked by Firebase Storage rules. Check your Storage rules and admin auth.";
              }
              if (err.code === "storage/unauthenticated") {
                return "Upload requires sign-in. Please sign in and try again.";
              }
              // When the browser blocks the request (CORS/preflight), Firebase commonly surfaces a generic error.
              // Give a concrete next step for local dev + production origins.
              return `Upload failed (${err.code}). If your browser console shows a CORS/preflight error, apply bucket CORS using \`cors.json\` (e.g. \`gsutil cors set cors.json gs://<your-bucket>\`).`;
            })()
          : "Upload failed. Please try again.";
      setGalleryUploadError(message);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const saveGallery = async (nextGallery) => {
    if (!isAdmin) return;
    setGalleryUploadError("");
    setIsSavingGallery(true);
    try {
      await updateDoc(doc(db, collectionName, id), {
        gallery: nextGallery,
        updatedAt: serverTimestamp(),
      });
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
    const nextHref = window.prompt("Project link (optional). Use /projects/<id> or https://…", current?.href || "") ?? null;
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

  const openGalleryLink = (href) => {
    if (!href) return;
    if (/^https?:\/\//i.test(href)) window.open(href, "_blank", "noreferrer");
    else navigate(href);
  };

  if (loading) return <DetailSkeleton />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg text-text font-body">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest ui-muted hover:opacity-100 opacity-80 transition cursor-pointer"
          >
            <IoArrowBackOutline /> Back
          </button>
          <div className="mt-10 p-8 ui-surface border ui-border shadow-[8px_8px_0px_0px_rgba(20,20,22,1)] dark:shadow-[8px_8px_0px_0px_rgba(247,244,234,0.12)]">
            <p className="text-xl font-black">Not found</p>
            <p className="mt-2 text-sm ui-muted">This {kindLabel.toLowerCase()} doesn’t exist (or was removed).</p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-text text-bg font-black uppercase tracking-widest hover:opacity-90 transition">
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
  const link = item?.link

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Navbar />

      {/* HERO */}
      <section className="pt-24">
        <div className="relative w-full h-[44vh] md:h-[54vh] overflow-hidden">
          {item?.image ? (
            <img
              ref={heroRef}
              src={item.image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover will-change-transform transition-transform duration-300"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-bg via-[#FFF7D6] to-bg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-6xl mx-auto px-6 pb-10">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest ui-muted hover:opacity-100 opacity-80 transition cursor-pointer"
              >
                <IoArrowBackOutline /> Back
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN INFO */}
      <section className="max-w-6xl mx-auto px-6 mt-8 md:mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 ui-surface border ui-border overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-black leading-tight break-words">{title}</h1>
              {subtitle ? <p className="mt-2 ui-muted font-black">{subtitle}</p> : null}
              {item?.shortDescription ? (
                <p className="mt-4 text-sm md:text-base ui-muted leading-relaxed">{item.shortDescription}</p>
              ) : null}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {duration ? (
                  <MetaRow icon={<IoCalendarOutline />} label="Date" value={duration} />
                ) : null}
                {location ? <MetaRow icon={<IoLocationOutline />} label="Location" value={location} /> : null}
                {item?.status ? <MetaRow label="Status" value={item.status} /> : null}
              </div>

              {Array.isArray(tags) && tags.length ? (
                <div className="mt-6">
                  <p className="text-[11px] font-black uppercase tracking-widest ui-muted opacity-80 mb-2">
                    Tech stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-[10px] font-black uppercase tracking-wider ui-pill border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="ui-surface border ui-border p-6">
              <p className="text-[11px] font-black uppercase tracking-widest ui-muted opacity-80">
                Actions
              </p>

              <div className="mt-4 flex flex-col h-[calc(100%-24px)]">
                <div className="flex-1 space-y-2">
                  {link?.length ? (
                    <a
                      href={`https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-4 py-3 border ui-border ui-action font-black text-sm break-all hover:opacity-90 transition"
                    >
                      <IoOpenOutline className="shrink-0" />
                      <span>{link}</span>
                    </a>
                  ) : (
                    <div className="text-sm ui-muted">No links available.</div>
                  )}
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-text text-bg font-black tracking-widest hover:opacity-90 transition"
                  >
                    <IoPencilOutline /> Edit
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="max-w-6xl mx-auto px-6 mt-10 md:mt-14">
        <div className="ui-surface border ui-border p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black">Details</h2>
          <div className="mt-6 space-y-6">
            <RichBlocks blocks={formattedDescription} />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {galleryItems.length || isAdmin ? (
        <section className="max-w-6xl mx-auto px-6 mt-10 md:mt-14 pb-16">
          <div className="ui-surface border ui-border p-6 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black">Gallery</h2>
              </div>
              <p className="text-xs font-black uppercase tracking-widest ui-muted opacity-80">{galleryItems.length} photos</p>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
                    className="group relative aspect-square overflow-hidden border ui-border ui-soft grid place-items-center focus:outline-none focus:ring-2 focus:ring-text disabled:opacity-70"
                    aria-label="Upload gallery images"
                    title="Upload gallery images"
                  >
                    <div className="grid place-items-center text-center px-4">
                      <div className="w-12 h-12 ui-badge grid place-items-center mb-3">
                        <IoAddOutline size={22} />
                      </div>
                      <div className="text-xs font-black uppercase tracking-widest">
                        {isUploadingGallery ? "Uploading…" : isSavingGallery ? "Saving…" : "Add photos"}
                      </div>
                      <div className="mt-1 text-[11px] ui-muted opacity-80">PNG/JPG/WebP</div>
                    </div>
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition" />
                  </button>
                </>
              ) : null}
              {galleryItems.map((g, idx) => (
                <div key={g.src} className="group relative aspect-square overflow-hidden border ui-border">
                  <button
                    onClick={() => openLightbox(idx)}
                    className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-text"
                    aria-label={`Open image ${idx + 1}`}
                    type="button"
                  >
                    <img
                      src={g.src}
                      alt={`${title} ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition" />
                    <div className="absolute bottom-2 right-2 w-9 h-9 ui-badge grid place-items-center opacity-0 group-hover:opacity-100 transition">
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
                      className="absolute top-2 left-2 w-9 h-9 ui-badge grid place-items-center opacity-0 group-hover:opacity-100 transition"
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
                        className="w-9 h-9 ui-badge grid place-items-center disabled:opacity-60"
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
                        className="w-9 h-9 ui-badge grid place-items-center disabled:opacity-60"
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

            {galleryUploadError ? <p className="mt-4 text-sm text-red-500 font-black">{galleryUploadError}</p> : null}
            {!galleryItems.length && !isUploadingGallery ? (
              <p className="mt-4 text-sm ui-muted">No photos yet.</p>
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

      <EditModal
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
  <div className="flex items-start gap-3">
    <div className="mt-[2px] ui-muted opacity-80">{icon}</div>

    <div>
      <div className="text-[11px] font-black uppercase tracking-widest ui-muted opacity-80">
        {label}
      </div>

      <div className="mt-1 text-sm font-black">
        {value} {" "}{value?.toLowerCase().includes("present") && (
          <p className="mt-1 text-xs text-orange-400/80">
            In progress
          </p>
        )}
      </div>
    </div>
  </div>
);

const ActionButton = ({ href, kind, label }) => {
  const Icon = kind === "github" ? FaGithub : IoOpenOutline;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 ui-action border font-black uppercase tracking-widest text-xs transition"
    >
      <Icon /> {label}
    </a>
  );
};

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
      items.push(lines[i].replace(/^[-•]\s+/, "").trim());
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
  return /^[-•]\s+/.test(line.trim());
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
    if (b.type === "p") {
      return (
        <p key={idx} className="text-sm md:text-base ui-muted leading-relaxed">
          {b.text}
        </p>
      );
    }
    if (b.type === "ul") {
      return (
        <ul key={idx} className="list-disc pl-5 space-y-2 text-sm md:text-base ui-muted">
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    }
    if (b.type === "section") {
      return (
        <div key={idx} className="border ui-border ui-highlight p-5 md:p-6">
          <div className="text-[11px] font-black uppercase tracking-widest ui-muted opacity-80">{b.title}</div>
          <div className="mt-3 space-y-4">
            <RichBlocks blocks={b.blocks} />
          </div>
        </div>
      );
    }
    return null;
  });
};

export default ItemDetailPage;

const DetailSkeleton = () => (
  <div className="min-h-screen bg-bg text-text font-body">
    <Navbar />
    <div className="pt-24">
      <div className="relative w-full h-[44vh] md:h-[54vh] overflow-hidden ui-soft animate-pulse" />
    </div>
    <div className="max-w-6xl mx-auto px-6 mt-8 md:mt-10 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 border ui-border ui-surface   p-8">
          <div className="h-6 w-2/3 ui-soft animate-pulse" />
          <div className="mt-4 h-4 w-full ui-soft animate-pulse" />
          <div className="mt-2 h-4 w-5/6 ui-soft animate-pulse" />
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-10 ui-soft animate-pulse" />
            <div className="h-10 ui-soft animate-pulse" />
            <div className="h-10 ui-soft animate-pulse" />
            <div className="h-10 ui-soft animate-pulse" />
          </div>
        </div>
        <div className="md:col-span-4 space-y-4">
          <div className="border ui-border ui-surface   p-6">
            <div className="h-4 w-24 ui-soft animate-pulse" />
            <div className="mt-4 space-y-2">
              <div className="h-10 ui-soft animate-pulse" />
              <div className="h-10 ui-soft animate-pulse" />
              <div className="h-10 ui-soft animate-pulse" />
            </div>
          </div>
          <div className="border ui-border ui-surface   p-6">
            <div className="h-4 w-28 ui-soft animate-pulse" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full ui-soft animate-pulse" />
              <div className="h-4 w-11/12 ui-soft animate-pulse" />
              <div className="h-4 w-10/12 ui-soft animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 mt-10 pb-16">
      <div className="border ui-border ui-surface   p-10">
        <div className="h-6 w-36 ui-soft animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full ui-soft animate-pulse" />
          <div className="h-4 w-11/12 ui-soft animate-pulse" />
          <div className="h-4 w-10/12 ui-soft animate-pulse" />
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
