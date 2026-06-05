import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, [location]);

  const linkClass =
    "relative px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#151513] after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[#ff5a36] after:transition-transform hover:after:origin-left hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2efe7]";

  const mobileLinkClass =
    "w-full border-2 border-[#151513] bg-[#fbf8f0] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[#151513] shadow-[3px_3px_0_#151513] transition hover:-translate-y-0.5 hover:bg-[#ff5a36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2";

  const NavItem = ({ link, mobile = false }) => {
    const className = mobile ? mobileLinkClass : linkClass;

    if (isHome) {
      return (
        <a href={`#${link.id}`} onClick={() => setIsOpen(false)} className={className}>
          {link.name}
        </a>
      );
    }

    return (
      <Link to={`/#${link.id}`} onClick={() => setIsOpen(false)} className={className}>
        {link.name}
      </Link>
    );
  };

    return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-3 text-[#151513]">
      <div className="mx-auto max-w-7xl border-2 border-[#151513] bg-[#f2efe7]/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
            aria-label="Tengku Haikal home"
          >
            <img
              src="/haikal-logo.svg"
              alt="Tengku Haikal logo"
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            />

            <span className="hidden text-[11px] font-black uppercase leading-tight tracking-[0.14em] sm:block">
              Tengku Haikal
              <span className="block text-[#5d5d56]">Portfolio</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 border-x border-[#d7d3c8] px-3 md:flex">
            {navLinks.map((link) => (
              <NavItem key={link.id} link={link} />
            ))}
          </div>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative mr-1 flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-[#151513] bg-[#fbf8f0] shadow-[3px_3px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span
              className={`absolute h-[2px] w-5 bg-current transition duration-300 ${isOpen ? "rotate-45" : "-translate-y-1.5"
                }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-current transition duration-300 ${isOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`absolute h-[2px] w-5 bg-current transition duration-300 ${isOpen ? "-rotate-45" : "translate-y-1.5"
                }`}
            />
          </button>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 md:hidden ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t-2 border-[#151513] px-1 py-4">
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
