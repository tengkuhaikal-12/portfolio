import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { useAuth } from "../auth/useAuth";

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
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    if (!result.user) {
      alert("Not authorized");
      await auth.signOut();
    }
  };

  return (
    <footer className="bg-ink text-paper/70 border-t border-paper/10 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Branding + Auth */}
        <div>
          <h2 className="text-paper text-lg font-semibold">Tengku Haikal</h2>
          <p className="text-sm mt-2">© 2026 All rights reserved</p>

          <img src="/haikal-logo.svg" alt="Logo" className="mt-4 h-20" />

          <div className="flex justify-between content-center w-max mt-4 gap-4">
            <button
              onClick={isAdmin ? () => navigate("/admin") : login}
              className="text-sm bg-paper text-ink px-4 py-1.5 rounded-full hover:opacity-90 transition cursor-pointer"
            >
              {isAdmin ? "Admin" : "Authenticate"}
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
