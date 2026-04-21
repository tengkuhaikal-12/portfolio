import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const Portfolio2 = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const snap = await getDocs(collection(db, "projects"));
            setProjects(snap.docs.map(doc => doc.data()));
        };

        fetchProjects();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">My Projects</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {projects.map((p, i) => (
                    <div key={i} className="border p-4 rounded-xl shadow">
                        <h2 className="text-xl font-semibold">{p.title}</h2>
                        <p className="text-gray-600">{p.description}</p>

                        <div className="flex gap-2 mt-2">
                            {p.techStack?.map((t, idx) => (
                                <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Portfolio2;