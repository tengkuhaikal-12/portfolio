import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import Loading from "../component/Loading";
import { useAuth } from "../auth/useAuth";
import { IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import EditModal from "../component/EditModal";

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const getColl = async (name) => {
          const q = query(collection(db, name), orderBy("sortDate", "desc"));
          const snap = await getDocs(q);
          return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        };

        const [projData, expData, eduData] = await Promise.all([
          getColl("projects"),
          getColl("experience"),
          getColl("education"),
        ]);

        setProjects(projData);
        setExperience(expData);
        setEducation(eduData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (collectionName, id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        if (collectionName === "projects") setProjects(prev => prev.filter(item => item.id !== id));
        if (collectionName === "experience") setExperience(prev => prev.filter(item => item.id !== id));
        if (collectionName === "education") setEducation(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Error deleting document:", err);
      }
    }
  };

  // 2. Add handleEdit logic
  const handleEdit = (collectionName, item) => {
    setSelectedItem(item);
    setSelectedCollection(collectionName);
    setIsModalOpen(true);
  };

  // 3. Add Success Logic to update the UI immediately
  const handleUpdateSuccess = (collectionName, updatedItem) => {
    const updateLocalState = (prev) => prev.map(item => item.id === updatedItem.id ? updatedItem : item);
    
    if (collectionName === "projects") setProjects(updateLocalState);
    if (collectionName === "experience") setExperience(updateLocalState);
    if (collectionName === "education") setEducation(updateLocalState);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">
      <Navbar />

      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28">
        <img
          src="/profile.jpg"
          alt="profile"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md mb-6"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Tengku Haikal</h1>
        <p className="text-gray-500 mb-6">Universiti Malaya Student • Software Developer</p>
        <p className="max-w-xl text-gray-600">
          Building clean, high-performance applications with focus on modern UI and scalable architecture.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-20">

        {/* EXPERIENCE */}
        <section id="experience" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold mb-6">Experience</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {experience.map((exp) => (
              <ExperienceCard
                key={exp.id}
                year={exp.duration}
                title={exp.title}
                org={exp.subtitle}
                desc={exp.description}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("experience", exp)}
                onDelete={() => handleDelete("experience", exp.id)}
              />
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold mb-6">Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                title={proj.title}
                tags={proj.techStack || []}
                desc={proj.description}
                image={proj.image}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("projects", proj)}
                onDelete={() => handleDelete("projects", proj.id)}
              />
            ))}
          </div>
        </section>

        {/* EDUCATION */}
        <section id="education" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold mb-6">Education</h2>
          <div className="flex flex-col gap-6">
            {education.map((edu) => (
              <EducationCard
                key={edu.id}
                year={edu.duration}
                degree={edu.title}
                institution={edu.subtitle}
                desc={edu.description}
                isAdmin={isAdmin}
                onEdit={() => handleEdit("education", edu)}
                onDelete={() => handleDelete("education", edu.id)}
              />
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-28 text-center">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-gray-600 mb-6">Let’s build something together.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">GitHub</a>
            <a href="#" className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">LinkedIn</a>
          </div>
        </section>
      </div>

      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedItem}
        collectionName={selectedCollection}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <Footer />
    </div>
  );
};

/* ---------------- INTERNAL COMPONENTS ---------------- */

const ControlButtons = ({ onEdit, onDelete }) => (
  <div className="flex gap-1 shrink-0">
    <button
      onClick={onEdit}
      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer"
    >
      <IoPencilOutline size={18} />
    </button>
    <button
      onClick={onDelete}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer"
    >
      <IoTrashOutline size={18} />
    </button>
  </div>
);

const ExperienceCard = ({ year, title, org, desc, isAdmin, onEdit, onDelete }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex flex-row justify-between items-start border border-gray-100">
    <div className="pr-2">
      <span className="text-sm text-gray-400">{year}</span>
      <h3 className="text-lg font-semibold capitalize">{title}</h3>
      <p className="text-sm text-gray-500 mb-2">{org}</p>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
    {isAdmin && <ControlButtons onEdit={onEdit} onDelete={onDelete} />}
  </div>
);

const ProjectCard = ({ title, tags, desc, image, isAdmin, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100 flex flex-col">
    {image && <img src={image} alt={title} className="w-full h-48 object-cover border-b" />}
    <div className="p-6 flex flex-row justify-between items-start gap-2">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      {isAdmin && <ControlButtons onEdit={onEdit} onDelete={onDelete} />}
    </div>
  </div>
);

const EducationCard = ({ year, degree, institution, desc, isAdmin, onEdit, onDelete }) => (
  <div className="bg-white p-6 shadow-md border-l-4 border-black hover:shadow-lg transition flex flex-row justify-between items-start">
    <div className="pr-4">
      <span className="text-sm text-gray-400 uppercase tracking-wide font-bold">{year}</span>
      <h3 className="text-lg font-semibold capitalize">{degree}</h3>
      <p className="text-sm text-gray-500 mb-2 capitalize">{institution}</p>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
    {isAdmin && <ControlButtons onEdit={onEdit} onDelete={onDelete} />}
  </div>
);

export default Portfolio;