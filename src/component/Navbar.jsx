import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../auth/useAuth";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {isAdmin} = useAuth();

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    if (result.user.email === "haikaltengku836@gmail.com") {
      navigate("/admin");
    } else {
      alert("Not authorized");
    }
  };
  const navLinks = [
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">

      {/* MAIN BAR */}
      <div className="bg-white/70 backdrop-blur-lg rounded-full shadow-md px-6 py-2 flex justify-between items-center border border-gray-200 bg-brand">

        {/* LOGO */}
        <a href='/'><img src="/haikal-logo.svg" alt="logo" className="h-9 cursor-pointer"/></a>

        {/* DESKTOP */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-gray-600 hover:text-white hover:bg-black px-4 py-1.5 rounded-full transition font-medium"
            >
              {link.name}
            </a>
          ))}

          <a
            href="/resume.pdf"
            className="bg-black text-white px-4 py-1.5 rounded-full text-sm hover:bg-gray-800 transition"
          >
            Resume
          </a>

        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          <span className={`absolute w-5 h-[2px] bg-black transition ${isOpen ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`absolute w-5 h-[2px] bg-black transition ${isOpen ? "opacity-0" : ""}`} />
          <span className={`absolute w-5 h-[2px] bg-black transition ${isOpen ? "-rotate-45" : "translate-y-1.5"}`} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-60 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md p-4 flex flex-col border border-gray-200">
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-white hover:bg-black rounded-full px-4 py-1.5 transition"
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