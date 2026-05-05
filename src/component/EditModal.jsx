import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { IoCloseOutline } from "react-icons/io5";

const EditModal = ({ isOpen, onClose, data, collectionName, onUpdateSuccess }) => {
  // 1. Setup States matching your Admin Panel
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: ""
  });

  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);

  // Month/Year Options
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
  const [startMonth, setStartMonth] = useState("Jan");
  const [startYear, setStartYear] = useState(currentYear.toString());
  const [endMonth, setEndMonth] = useState("Jan");
  const [endYear, setEndYear] = useState("Present");

  const [loading, setLoading] = useState(false);

  // 2. Pre-fill data when modal opens
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        description: data.description || "",
        image: data.image || ""
      });
      setTechStack(data.techStack || []);
      
      // Parse the duration string back into dropdowns (Simple split logic)
      if (data.duration) {
        const parts = data.duration.split(" - ");
        const startParts = parts[0].split(" ");
        setStartMonth(startParts[0]);
        setStartYear(startParts[1]);
        
        if (parts[1] === "Present") {
          setEndYear("Present");
        } else {
          const endParts = parts[1].split(" ");
          setEndMonth(endParts[0]);
          setEndYear(endParts[1]);
        }
      }
    }
  }, [data]);

  if (!isOpen || !data) return null;

  // 3. Logic Handlers
  const handleAddTech = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = techInput.trim().replace(/,/g, "");
      if (value && !techStack.includes(value)) setTechStack([...techStack, value]);
      setTechInput("");
    }
  };

  const removeTech = (index) => setTechStack(techStack.filter((_, i) => i !== index));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setFormData({ ...formData, image: reader.result });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startMonthIdx = months.indexOf(startMonth);
      const sortValue = (parseInt(startYear) * 12) + startMonthIdx;
      const durationString = endYear === "Present" 
        ? `${startMonth} ${startYear} - Present` 
        : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

      const updatedData = {
        ...formData,
        duration: durationString,
        sortDate: sortValue,
        techStack: collectionName === "projects" ? techStack : [],
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, collectionName, data.id), updatedData);
      onUpdateSuccess(collectionName, { ...updatedData, id: data.id });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 ui-soft border-2 ui-border focus:border-text outline-none transition text-sm";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md">
      <div className="ui-surface text-text w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] border ui-border">
        <div className="bg-ink p-6 text-paper flex justify-between items-center sticky top-0 z-10 border-b border-paper/10">
          <h2 className="text-xl font-bold uppercase tracking-widest">Edit {collectionName}</h2>
          <button onClick={onClose} className="hover:text-red-400 transition cursor-pointer">
            <IoCloseOutline size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase ui-muted opacity-80 mb-1 block">Title</label>
              <input required className={inputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-black uppercase ui-muted opacity-80 mb-1 block">Subtitle / Role</label>
              <input required className={inputClass} value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase ui-muted opacity-80 block">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className={inputClass} value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={endMonth} onChange={(e) => setEndMonth(e.target.value)} disabled={endYear === "Present"}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className={inputClass} value={endYear} onChange={(e) => setEndYear(e.target.value)}>
                  <option value="Present">Present</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {collectionName === "projects" && (
              <div>
                <label className="text-xs font-black uppercase ui-muted opacity-80 mb-1 block">Tech Stack (Enter to add)</label>
                <input className={inputClass} value={techInput} onKeyDown={handleAddTech} onChange={(e) => setTechInput(e.target.value)} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech, i) => (
                    <span key={i} className="ui-pill border px-2 py-1 text-[10px] font-bold">
                      {tech} <button type="button" onClick={() => removeTech(i)} className="ml-1 text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-black uppercase ui-muted opacity-80 mb-1 block">Description</label>
              <textarea rows="4" className={inputClass} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-black uppercase ui-muted opacity-80 mb-1 block">Update Image</label>
              <input type="file" onChange={handleImage} className="text-xs cursor-pointer block w-full" />
              {formData.image && <img src={formData.image} className="mt-2 h-16 border ui-border" alt="preview" />}
            </div>
          </div>

          <button disabled={loading} type="submit" className="md:col-span-2 w-full bg-text text-bg py-4 font-black uppercase tracking-widest hover:opacity-90 transition disabled:opacity-60 shadow-xl">
            {loading ? "Saving Changes..." : "Update Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
