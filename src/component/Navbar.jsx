import React, { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Experience', href: '#experience' },
        { name: 'Projects', href: '#projects' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className={`sticky top-0 z-50 border-b-4 border-black px-6 py-4 transition-shadow bg-white`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO */}
                <div className="font-display text-l font-black uppercase tracking-tighter">
                    <a href="/" className="hover:text-accent transition-colors">
                        <img src="/haikal-logo.svg" alt="TMHTA" className='h-15 w-auto object-contain'/>
                    </a>
                </div>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="font-display font-black uppercase text-sm hover:bg-black hover:text-white px-2 py-1 transition-all font-20 border-2"
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        href="/resume.pdf"
                        className="bg-brand border-2 border-black px-4 py-1 font-display font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        Resume
                    </a>
                </div>

                {/* MOBILE MENU BUTTON */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden border-2 border-black p-2 bg-accent relative w-8 h-8 flex items-center justify-center"
                >
                    <span
                        className={`absolute w-6 h-1 bg-black transition-all duration-300 ${isOpen ? "rotate-45" : "-translate-y-2"
                            }`}
                    ></span>

                    <span
                        className={`absolute w-6 h-1 bg-black transition-all duration-300 ${isOpen ? "opacity-0" : ""
                            }`}
                    ></span>

                    <span
                        className={`absolute w-6 h-1 bg-black transition-all duration-300 ${isOpen ? "-rotate-45" : "translate-y-2"
                            }`}
                    ></span>
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            {isOpen && (
                <div className="md:hidden absolute top-[100%] right-0 bg-accent border-4 border-black p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="font-display font-black uppercase text-l border-b-2 border-black pb-2 hover:bg-black hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;