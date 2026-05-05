import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { useAuth } from "../auth/useAuth";
import AlertModal from "./AlertModal";

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
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "" });

  const isHome = location.pathname === "/";

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (cancelled) return;
        if (result?.user) {
          setAlertState({
            open: true,
            title: "Signed in",
            message: `Signed in as ${result.user.email || result.user.uid}.`,
          });
        }
      } catch (e) {
        if (cancelled) return;
        console.warn("Redirect auth failed:", e);
        setAlertState({
          open: true,
          title: "Login failed",
          message: e?.message || "Redirect login failed.",
        });
      } finally {
        if (!cancelled) setAuthBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async () => {
    setAuthBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
      console.warn("Auth persistence not available:", e?.code || e?.message || e);
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (!result?.user) {
        setAlertState({ open: true, title: "Unauthorized", message: "Not authorized." });
        await auth.signOut();
      }
    } catch (e) {
      const code = e?.code ? String(e.code) : "";
      const msg = e?.message || "Authentication failed";
      if (e?.code === "auth/missing-initial-state") {
        setAlertState({
          open: true,
          title: "Auth failed",
          message:
            "Browser storage is blocked (session/local storage).\n\nTry: disable strict tracking prevention, allow cookies/storage for this site, or open in a normal browser tab.",
        });
        return;
      }
      if (e?.code === "auth/popup-blocked") {
        setAlertState({ open: true, title: "Popup blocked", message: "Please allow popups for this site and try again." });
        return;
      }
      if (e?.code === "auth/popup-closed-by-user") {
        setAlertState({ open: true, title: "Popup closed", message: "You closed the sign-in popup before completing login." });
        return;
      }
      if (e?.code === "auth/invalid-api-key") {
        setAlertState({
          open: true,
          title: "Firebase config error",
          message: "Invalid API key. Check `VITE_FB_API_KEY` in your environment variables.",
        });
        return;
      }
      console.error("Auth failed:", e);
      setAlertState({
        open: true,
        title: "Authentication failed",
        message: `${code ? `Code: ${code}\n\n` : ""}${msg}`,
      });
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
        onClose={() => setAlertState({ open: false, title: "", message: "" })}
      />
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Branding + Auth */}
        <div>
          <h2 className="text-paper text-lg font-semibold">Tengku Haikal</h2>
          <p className="text-sm mt-2">© 2026 All rights reserved</p>

          <img src="/haikal-logo.svg" alt="Logo" className="mt-4 h-20" />

          <div className="flex justify-between content-center w-max mt-4 gap-4">
            <button
              onClick={isAdmin ? () => navigate("/admin") : login}
              disabled={authBusy || loading}
              className="text-sm bg-paper text-ink px-4 py-1.5 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              {isAdmin ? "Admin" : authBusy ? "Please wait…" : "Authenticate"}
            </button>
          </div>
        </div>

        {/* Column 2: About */}
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

        {/* Column 3: Contact */}
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
