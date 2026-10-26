import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

const SCROLL_THRESHOLD = 10;
const COMPACT_AFTER_SCROLL = 80;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const location = useLocation();
  const lastScrollY = useRef(0);

  useAuth();

  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "Badges", id: "badges" },
    { name: "Experience", id: "experience" },
    { name: "Projects", id: "projects" },
    { name: "Education", id: "education" },
    { name: "Contact", id: "contact" },
  ];

  // Shrink on scroll down and expand on scroll up.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= COMPACT_AFTER_SCROLL) {
        setIsCompact(false);
      } else if (difference > SCROLL_THRESHOLD) {
        setIsCompact(true);
        setIsOpen(false);
      } else if (difference < -SCROLL_THRESHOLD) {
        setIsCompact(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll to a section when navigating with a URL hash.
  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.slice(1);

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [location]);

  const linkClass =
    "relative px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-ink)] after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[var(--color-accent)] after:transition-transform hover:after:origin-left hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]";

  const mobileLinkClass =
    "w-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2";

  const NavItem = ({ link, mobile = false }) => {
    const className = mobile ? mobileLinkClass : linkClass;

    const handleClick = () => {
      setIsOpen(false);
      setIsCompact(false);
    };

    if (isHome) {
      return (
        <a
          href={`#${ link.id } `}
          onClick={handleClick}
          className={className}
        >
          {link.name}
        </a>
      );
    }

    return (
      <Link
        to={`/ #${ link.id } `}
        onClick={handleClick}
        className={className}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <nav className="fixed left-0 right-0 top-4 z-[500] px-3 text-[var(--color-ink)]">
      {/* Main navbar container */}
      <div
        className={`mx-auto border-2 border-[var(--color-ink)] bg-[rgb(var(--color-paper-rgb))] shadow-[4px_4px_0_var(--color-ink)] transition-all duration-300 ease-in-out ${
  isCompact
    ? "flex w-fit items-center justify-start p-1"
    : "max-w-7xl px-3"
} `}
      >
        {/* Navbar main row */}
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${
  isCompact
    ? "min-h-0 justify-center gap-0"
    : "min-h-15 justify-between gap-4"
} `}
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              setIsOpen(false);
              setIsCompact(false);
            }}
            className={`flex shrink-0 items-center justify-center border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]focus-visible:ring-offset-2 ${
  isCompact ? "h-12 w-12" : "gap-3"
} `}
            aria-label="Tengku Haikal home"
          >
            <img
              src="/haikal-logo.svg"
              alt="Tengku Haikal logo"
              className={`block shrink-0 object-contain transition-all duration-300 ${
  isCompact
    ? "h-10 w-10"
    : "h-11 w-11 sm:h-12 sm:w-12"
} `}
            />

            {!isCompact && (
              <span className="whitespace-nowrap text-[11px] font-black uppercase leading-tight tracking-[0.14em]">
                Tengku Haikal
                <span className="block text-[var(--color-muted)]">
                  Portfolio
                </span>
              </span>
            )}
          </Link>

          {/* Desktop navigation */}
          {!isCompact && (
            <div className="hidden items-center gap-2 border-x border-[var(--color-paper-muted)] px-3 transition-all duration-300 md:flex">
              {navLinks.map((link) => (
                <NavItem key={link.id} link={link} />
              ))}
            </div>
          )}

          {/* Mobile menu button */}
          {!isCompact && (
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="relative mr-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] shadow-[3px_3px_0_var(--color-ink)] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <span
                className={`absolute h-[2px] w-5 bg-current transition duration-300 ${
  isOpen ? "rotate-45" : "-translate-y-1.5"
} `}
              />

              <span
                className={`absolute h-[2px] w-5 bg-current transition duration-300 ${
  isOpen ? "opacity-0" : ""
} `}
              />

              <span
                className={`absolute h-[2px] w-5 bg-current transition duration-300 ${
  isOpen ? "-rotate-45" : "translate-y-1.5"
} `}
              />
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        <div
          className={`grid transition-[grid-template-rows, opacity] duration-300 md:hidden ${
  isOpen && !isCompact
    ? "grid-rows-[1fr] opacity-100"
    : "grid-rows-[0fr] opacity-0"
} `}
          aria-hidden={!isOpen || isCompact}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t-2 border-[var(--color-ink)] px-1 py-4">
              {navLinks.map((link) => (
                <NavItem
                  key={link.id}
                  link={link}
                  mobile
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;