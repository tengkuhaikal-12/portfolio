import { useEffect, useRef, useState } from "react";
import { IoArrowForwardOutline, IoPencilOutline } from "react-icons/io5";
import AlertModal from "@/shared/components/AlertModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  DEFAULT_HERO_PROFILE_IMAGE,
  subscribeHeroProfile,
  updateHeroProfileImage,
} from "@/features/dashboard/data/heroProfileService";
import { heroStyles } from "@/features/dashboard/presentation/components/hero/HeroStyles";
import { uploadImage, validateImageFile } from "@/shared/services/firebase/imageUpload";

const Hero = () => {
  const fileInputRef = useRef(null);
  const { isAdmin } = useAuth();
  const [profileImage, setProfileImage] = useState(DEFAULT_HERO_PROFILE_IMAGE);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "" });

  useEffect(() => {
    const unsubscribe = subscribeHeroProfile(
      (profile) => setProfileImage(profile.image),
      (error) => {
        console.warn("Hero profile image unavailable:", error?.message || error);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openImagePicker = () => {
    if (!isAdmin || uploading) return;
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploading(true);
      setUploadProgress(1);

      const downloadUrl = await uploadImage(file, {
        folder: "portfolio/profile",
        onProgress: setUploadProgress,
      });

      await updateHeroProfileImage(downloadUrl);
      setProfileImage(downloadUrl);
      setPreviewUrl("");
      setAlertState({
        open: true,
        title: "Profile updated",
        message: "The hero profile picture has been updated successfully.",
      });
    } catch (error) {
      setPreviewUrl("");
      setAlertState({
        open: true,
        title: "Image update failed",
        message: error?.message || "Unable to update the profile picture.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const displayedImage = previewUrl || profileImage;

  return (
    <header className={heroStyles.header}>
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ open: false, title: "", message: "" })}
      />

      <div className={heroStyles.container}>
        <div>
          <div className={heroStyles.eyebrow}>
            <span className="h-[3px] w-10 bg-[var(--color-accent)]" />
            Software Engineering Intern / Putrajaya, MY
          </div>

          <h1 className={heroStyles.title}>
            Tengku
            <span className="block text-[var(--color-accent)]">Haikal.</span>
          </h1>

          <p className="mt-8 max-w-xl border-l-4 border-[var(--color-ink)] pl-5 text-base font-black leading-relaxed text-[var(--color-muted)] sm:text-lg">
            Universiti Malaya <br /> Bachelor of Computer Science (Software Engineering)
          </p>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            A curious developer who enjoys transforming ideas into real applications that people can use and benefit from.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href="#projects" className={heroStyles.primaryLink}>
              View projects <IoArrowForwardOutline size={18} />
            </a>
            <a href="#contact" className={heroStyles.secondaryLink}>
              Start a conversation
            </a>
          </div>
        </div>

        <div className={heroStyles.panel}>
          <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--color-white-rgb)/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-white-rgb)/0.07)_1px,transparent_1px)] [background-size:38px_38px]" />
          <div className="absolute -right-14 top-16 h-7 w-64 rotate-45 bg-[var(--color-accent)]" />
          <div className="absolute -left-14 bottom-20 h-7 w-64 -rotate-45 bg-[var(--color-accent)]" />
          <div className="absolute left-6 top-6 z-100 border-2 border-[var(--color-paper-light)] bg-[var(--color-ink)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-paper-light)]">
            Profile / 001
          </div>
          <div className="absolute bottom-8 left-1/2 z-10 w-[82%] max-w-[360px] -translate-x-1/2 -rotate-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-3 shadow-[7px_7px_0_var(--color-accent)] transition duration-300 hover:rotate-0 sm:bottom-10 sm:w-[74%] sm:max-w-[420px] sm:p-4 lg:bottom-12 lg:w-[64%]">
            <div className="relative">
              <img
                src={displayedImage}
                alt="Tengku Haikal"
                className="aspect-[4/5] w-full border-2 border-[var(--color-ink)] object-cover grayscale transition duration-300 hover:grayscale-0"
              />

              {isAdmin ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfileImageChange}
                    className="sr-only"
                    disabled={uploading}
                    aria-label="Choose profile picture"
                  />
                  <button
                    type="button"
                    onClick={openImagePicker}
                    disabled={uploading}
                    className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                    aria-label="Edit profile picture"
                  >
                    <IoPencilOutline size={20} />
                  </button>

                  {uploading ? (
                    <div className="absolute bottom-3 left-3 right-3 z-20 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-1 shadow-[3px_3px_0_var(--color-ink)]">
                      <div className="mb-1 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        <span>Uploading</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 border border-[var(--color-ink)] bg-[var(--color-paper)]">
                        <div
                          className="h-full bg-[var(--color-accent)] transition-[width]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.14em]">Software Engineering</span>
              <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
