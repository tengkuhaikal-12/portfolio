import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import AlertModal from "@/shared/components/AlertModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginWithGooglePopup } from "@/features/auth/services/authService";
import { ROUTES } from "@/shared/constants/routes";

const CONTACT_LINKS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/your-profile",
    icon: FaLinkedin,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/your-handle",
    icon: FaInstagram,
  },
  {
    label: "GitHub",
    href: "https://github.com/your-username",
    icon: FaGithub,
  },
  {
    label: "Email",
    href: "mailto:your@email.com",
    icon: MdEmail,
  },
];

const FooterNavLink = ({ isHome, id, children }) => {
  const className =
    "relative w-fit font-black uppercase tracking-[0.1em] text-[var(--color-paper-light)] after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[var(--color-accent)] after:transition-transform hover:after:origin-left hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  if (isHome) {
    return (
      <a href={`#${id}`} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={`/#${id}`} className={className}>
      {children}
    </Link>
  );
};

const Footer = () => {
  const { isAdmin, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [authBusy, setAuthBusy] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    title: "",
    message: "",
  });

  const isHome = location.pathname === "/";

  const showAlert = (title, message) => {
    setAlertState({
      open: true,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlertState({
      open: false,
      title: "",
      message: "",
    });
  };

  const login = async () => {
    setAuthBusy(true);

    try {
      const result = await loginWithGooglePopup();

      showAlert(
        "Signed in",
        `Signed in as ${result.user.email}`
      );

      navigate(ROUTES.admin);
    } catch (error) {
      const code = error?.code
        ? String(error.code)
        : "";

      if (code === "auth/not-admin") {
        showAlert(
          "Unauthorized",
          "Only the owner admin account is allowed to sign in."
        );
        return;
      }

      if (code === "auth/popup-blocked") {
        showAlert(
          "Popup blocked",
          "Please allow popups for this site and try again."
        );
        return;
      }

      if (code === "auth/popup-closed-by-user") {
        showAlert(
          "Popup closed",
          "You closed the sign-in popup before completing login."
        );
        return;
      }

      if (code === "auth/invalid-api-key") {
        showAlert(
          "Firebase config error",
          "Invalid API key. Check your Firebase environment variables."
        );
        return;
      }

      showAlert(
        "Authentication failed",
        `${code ? `Code: ${code}\n\n` : ""}${error?.message || "Authentication failed"
        }`
      );
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <footer className="border-t-2 border-[var(--color-ink)] bg-[var(--color-footer)] text-[var(--color-muted-light)]">
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:px-6">

        {/* Left */}
        <div>
          <div className="flex items-center gap-4">
            <img
              src="/haikal-logo.svg"
              alt=""
              className="h-14 w-14 object-contain"
            />

            <div>
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-[var(--color-paper-light)]">
                Tengku Haikal
              </h2>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em]">
                Software engineering portfolio
              </p>
            </div>
          </div>

          <p className="mt-7 max-w-sm text-xs leading-relaxed">
            Copyright 2026. All rights reserved.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              disabled={authBusy || loading}
              onClick={
                isAdmin
                  ? () => navigate(ROUTES.admin)
                  : login
              }
              className="border-2 border-[var(--color-paper-light)] bg-[var(--color-paper-light)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-[4px_4px_0_var(--color-accent)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-accent)] disabled:opacity-60"
            >
              {isAdmin
                ? "Admin"
                : authBusy
                  ? "Opening..."
                  : "Authenticate"}
            </button>

            {isAdmin && (
              <button
                onClick={() =>
                  navigate(
                    ROUTES.adminAnalytics
                  )
                }
                className="border-2 border-[var(--color-paper-light)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-paper-light)] shadow-[4px_4px_0_var(--color-accent)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] hover:shadow-[2px_2px_0_var(--color-accent)]"
              >
                Analytics
              </button>
            )}
          </div>
        </div>

        {/* Index */}
        <div>
          <h3 className="mb-5 border-b border-[var(--color-panel-muted)] pb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Index
          </h3>

          <ul className="space-y-4 text-xs">
            <li><FooterNavLink isHome={isHome} id="experience">Experience</FooterNavLink></li>
            <li><FooterNavLink isHome={isHome} id="projects">Projects</FooterNavLink></li>
            <li><FooterNavLink isHome={isHome} id="education">Education</FooterNavLink></li>
            <li><FooterNavLink isHome={isHome} id="contact">Contact</FooterNavLink></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 border-b border-[var(--color-panel-muted)] pb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Contact
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {CONTACT_LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={
                    item.href.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  rel="noreferrer"
                  className="group flex min-h-20 flex-col items-center justify-center gap-2 border-2 border-[var(--color-paper-light)] bg-[var(--color-panel)] p-3 text-[var(--color-paper-light)] shadow-[3px_3px_0_var(--color-accent)] transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] hover:shadow-[1px_1px_0_var(--color-accent)]"
                >
                  <Icon
                    size={20}
                    className="transition-transform group-hover:scale-110"
                  />

                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
