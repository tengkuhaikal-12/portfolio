import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginWithGooglePopup } from "@/features/auth/services/authService";
import { ROUTES } from "@/shared/constants/routes";

const FooterNavLink = ({ isHome, id, children }) => {
  if (isHome) {
    return (
      <a href={`#${id}`} className="hover:text-paper">
        {children}
      </a>
    );
  }

  return (
    <Link to={`/#${id}`} className="hover:text-paper">
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
    setAlertState({ open: true, title, message });
  };

  const closeAlert = () => {
    setAlertState({ open: false, title: "", message: "" });
  };

  const login = async () => {
    setAuthBusy(true);

    try {
      const result = await loginWithGooglePopup();
      showAlert("Signed in", `Signed in as ${result.user.email}`);
      navigate(ROUTES.admin);
    } catch (error) {
      const code = error?.code ? String(error.code) : "";

      if (code === "auth/not-admin") {
        showAlert("Unauthorized", "Only the site owner is authorized to sign in.");
        return;
      }

      if (code === "auth/popup-blocked") {
        showAlert("Popup blocked", "Please allow popups for this site and try again.");
        return;
      }

      if (code === "auth/popup-closed-by-user") {
        showAlert("Popup closed", "You closed the sign-in popup before completing login.");
        return;
      }

      if (code === "auth/invalid-api-key") {
        showAlert("Firebase config error", "Invalid API key. Check your Firebase environment variables.");
        return;
      }

      showAlert("Authentication failed", `${code ? `Code: ${code}\n\n` : ""}${error?.message || "Authentication failed"}`);
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <footer className="bg-ink text-paper/70 border-t border-paper/10 py-10">
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-paper text-lg font-semibold">Tengku Haikal</h2>
          <p className="text-sm mt-2">Copyright 2026 All rights reserved</p>

          <img src="/haikal-logo.svg" alt="Logo" className="mt-4 h-20" />

          <div className="flex justify-between content-center w-max mt-4 gap-4">
            <button
              type="button"
              onClick={isAdmin ? () => navigate(ROUTES.admin) : login}
              disabled={authBusy || loading}
              className="text-sm bg-paper text-ink px-4 py-1.5 rounded-full hover:opacity-90 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAdmin ? "Admin" : authBusy ? "Opening..." : "Authenticate"}
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.adminAnalytics)}
                className="text-sm border border-paper/40 text-paper px-4 py-1.5 rounded-full hover:opacity-90 transition cursor-pointer"
              >
                Analytics
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-paper font-medium mb-3">About</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <FooterNavLink isHome={isHome} id="experience">
                Experience
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink isHome={isHome} id="projects">
                Projects
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink isHome={isHome} id="education">
                Education
              </FooterNavLink>
            </li>
            <li>
              <FooterNavLink isHome={isHome} id="contact">
                Contact
              </FooterNavLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-paper font-medium mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper"
              >
                GitHub
              </a>
            </li>
            <li>
              <a href="mailto:your@email.com" className="hover:text-paper">
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
