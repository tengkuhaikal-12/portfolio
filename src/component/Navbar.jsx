import { useState } from 'react';
import { useAuth } from "../auth/useAuth";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  useAuth();

  // Intentionally keep auth imports available for future navbar actions.
  const navLinks = [
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">

      {/* MAIN BAR */}
      <div className="ui-nav backdrop-blur-lg rounded-full shadow-md pl-4 pr-1 py-1 flex justify-between items-center border">

        {/* LOGO */}
        <a href='/'><img src="/haikal-logo.svg" alt="logo" className="h-9 cursor-pointer"/></a>

        {/* DESKTOP */}
        <div className="hidden md:flex gap-1 items-center">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm ui-navlink hover:bg-text hover:text-bg px-4 py-1.5 rounded-full transition font-medium"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex items-center justify-center cursor-pointer mr-2"
        >
          <span className={`absolute w-5 h-[2px] bg-text transition ${isOpen ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`absolute w-5 h-[2px] bg-text transition ${isOpen ? "opacity-0" : ""}`} />
          <span className={`absolute w-5 h-[2px] bg-text transition ${isOpen ? "-rotate-45" : "translate-y-1.5"}`} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-60 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ui-navmenu backdrop-blur-lg rounded-2xl shadow-md p-4 flex flex-col border">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="ui-navlink hover:bg-text hover:text-bg rounded-full px-4 py-1.5 transition"
            >
              {link.name}
            </a>
          ))}

        </div>
      </div>

    </nav>
  );
};

export default Navbar;
