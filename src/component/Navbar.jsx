import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useAuth();

  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "Experience", id: "experience" },
    { name: "Projects", id: "projects" },
    { name: "Education", id: "education" },
    { name: "Contact", id: "contact" },
  ];

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, [location]);

  const linkClass =
    "text-sm ui-navlink hover:bg-text hover:text-bg focus:bg-text focus:text-bg focus:outline-none px-4 py-1.5 rounded-full transition font-medium";

  const mobileLinkClass =
    "w-full text-left ui-navlink hover:bg-text hover:text-bg focus:bg-text focus:text-bg focus:outline-none rounded-full px-4 py-2.5 transition font-medium";

  const NavItem = ({ link, mobile = false }) => {
    const className = mobile ? mobileLinkClass : linkClass;

    if (isHome) {
      return (
        <a
          href={`#${link.id}`}
          onClick={() => setIsOpen(false)}
          className={className}
        >
          {link.name}
        </a>
      );
    }

    return (
      <Link
        to={`/#${link.id}`}
        onClick={() => setIsOpen(false)}
        className={className}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="ui-nav border shadow-md backdrop-blur-lg overflow-hidden rounded-[28px] md:rounded-full">
        <div className="flex items-center justify-between pl-5 pr-2 py-2">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img
              src="/haikal-logo.svg"
              alt="logo"
              className="h-9 cursor-pointer"
            />
          </Link>

          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map((link) => (
              <NavItem key={link.id} link={link} />
            ))}
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden relative w-9 h-9 flex items-center justify-center cursor-pointer mr-1 rounded-full hover:bg-text hover:text-bg focus:bg-text focus:text-bg focus:outline-none transition"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute w-5 h-[2px] bg-current transition duration-300 ${isOpen ? "rotate-45" : "-translate-y-1.5"
                }`}
            />
            <span
              className={`absolute w-5 h-[2px] bg-current transition duration-300 ${isOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`absolute w-5 h-[2px] bg-current transition duration-300 ${isOpen ? "-rotate-45" : "translate-y-1.5"
                }`}
            />
          </button>
        </div>

        <div
          className={`md:hidden grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
              {navLinks.map((link) => (
                <NavItem key={link.id} link={link} mobile />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;