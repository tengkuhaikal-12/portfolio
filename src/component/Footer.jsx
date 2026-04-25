import {React} from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../auth/useAuth";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";


const Footer = () => {
    const { user, isAdmin } = useAuth();

    const navigate = useNavigate();

    const login = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        if (!result.user) {
            alert("Not authorized");
            await auth.signOut();
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <footer className="bg-black text-gray-400 border-t py-10">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Column 1: Branding + Auth */}
                <div>
                    <h2 className="text-white text-lg font-semibold">
                        Tengku Haikal
                    </h2>
                    <p className="text-sm mt-2">
                        © 2026 All rights reserved
                    </p>

                    <img src="/haikal-logo.svg" alt="Logo" className="mt-4 h-20" />

                    <div className=' flex justify-between content-center w-max mt-4    gap-4 '>
                        <button
                            onClick={isAdmin ? () => navigate("/admin") : login}
                            className=" text-sm bg-white text-black px-4 py-1.5 rounded-full hover:bg-black hover:text-white transition cursor-pointer"
                        >
                            {isAdmin ? "Admin" : "Authenticate"}
                        </button>
                    </div>

                </div>

                {/* Column 2: About */}
                <div>
                    <h3 className="text-white font-medium mb-3">About</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href='#experience' className="hover:text-white">
                                Experience
                            </a>
                        </li>
                        <li>
                            <a href="#projects" className="hover:text-white">
                                Projects
                            </a>
                        </li>
                        <li>
                            <a href="#education" className="hover:text-white">
                                Education
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div>
                    <h3 className="text-white font-medium mb-3">Contact</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white">
                                LinkedIn
                            </a>
                        </li>
                        <li>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
                                Instagram
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">
                                GitHub
                            </a>
                        </li>
                        <li>
                            <a href="mailto:your@email.com" className="hover:text-white">
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