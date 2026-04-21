import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";

const ADMIN_EMAIL = "haikaltengku836@gmail.com";

const Admin = () => {

    useEffect(() => {
        const test = async () => {
            const snap = await getDocs(collection(db, "projects"));
            console.log("🔥 Firebase working:", snap.docs.length);
        };

        test();
    }, []);

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [tech, setTech] = useState("");

    const login = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        if (result.user.email !== ADMIN_EMAIL) {
            alert("Not authorized");
            await auth.signOut();
        }
    };

    const addProject = async () => {
        await addDoc(collection(db, "projects"), {
            title,
            description: desc,
            techStack: tech.split(","),
            createdAt: new Date()
        });

        alert("Project added!");

        setTitle("");
        setDesc("");
        setTech("");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>

            <button onClick={login} className="bg-black text-white px-4 py-2 my-4">
                Login with Google
            </button>

            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 block mb-2"
            />

            <textarea
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="border p-2 block mb-2"
            />

            <input
                placeholder="Tech stack (React,Node,...)"
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className="border p-2 block mb-2"
            />

            <button onClick={addProject} className="bg-green-600 text-white px-4 py-2">
                Save Project
            </button>
        </div>
    );
};

export default Admin;

