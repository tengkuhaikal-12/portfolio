import { useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase/firebase";
import { useAuth } from "../auth/useAuth";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { IoPowerOutline } from "react-icons/io5";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("projects");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image: ""
    });

    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [techInput, setTechInput] = useState("");
    const [techStack, setTechStack] = useState([]);

    // Month and Year Logic
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

    const [startMonth, setStartMonth] = useState("Jan");
    const [startYear, setStartYear] = useState(currentYear.toString());
    const [endMonth, setEndMonth] = useState("Jan");
    const [endYear, setEndYear] = useState("Present");

    const handleAddTech = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = techInput.trim().replace(/,/g, "");
            if (value && !techStack.includes(value)) {
                setTechStack([...techStack, value]);
            }
            setTechInput("");
        }
    };

    const removeTech = (indexToRemove) => {
        setTechStack(techStack.filter((_, index) => index !== indexToRemove));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setFormData({ ...formData, image: reader.result });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Logic to calculate sortable value: (Year * 12) + MonthIndex
            const startMonthIdx = months.indexOf(startMonth);
            const sortValue = (parseInt(startYear) * 12) + startMonthIdx;

            const durationString = endYear === "Present"
                ? `${startMonth} ${startYear} - Present`
                : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

            await addDoc(collection(db, activeTab), {
                ...formData,
                duration: durationString,
                sortDate: sortValue, // This is what we will use to order the fetch
                techStack: activeTab === "projects" ? techStack : [],
                createdAt: serverTimestamp()
            });

            alert(`Successfully added to ${activeTab}!`);
            setFormData({ title: "", subtitle: "", description: "", image: "" });
            setTechStack([]);
            setTechInput("");
        } catch (err) {
            console.error(err);
            alert("Error saving data");
        } finally {
            setLoading(false);
        }
    };

    const inputFields = [
        { tab: 'projects', title: 'Project Name', role: 'Role/Position' },
        { tab: 'experience', title: 'Job Title', role: 'Company/Organization' },
        { tab: 'education', title: 'Programme', role: 'Institution' }
    ];

    const logout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const inputClassNames = "w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-gray-500 outline-none transition";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-10 flex justify-center items-center">
            <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-black p-6 text-white flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-widest uppercase">Portfolio Manager</h1>
                    <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer">
                        <IoPowerOutline size={20} /> Logout
                    </button>
                </div>

                <div className="flex bg-black border-t border-gray-800">
                    {["projects", "experience", "education"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 capitalize font-bold transition border-b-4 ${activeTab === tab ? "bg-white text-black border-gray-500" : "text-gray-400 border-transparent hover:text-white"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase">{inputFields.find(f => f.tab === activeTab).title}</label>
                            <input required className={inputClassNames} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase">{inputFields.find(f => f.tab === activeTab).role}</label>
                            <input required className={inputClassNames} value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                        </div>

                        {/* DURATION INPUTS */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-500 uppercase">Start Date</label>
                            <div className="flex gap-2">
                                <select className={inputClassNames} value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select className={inputClassNames} value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <label className="block text-xs font-black text-gray-500 uppercase">End Date</label>
                            <div className="flex gap-2">
                                <select className={inputClassNames} value={endMonth} onChange={(e) => setEndMonth(e.target.value)} >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select className={inputClassNames} value={endYear} onChange={(e) => setEndYear(e.target.value)}>
                                    <option value="Present">Present</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {activeTab === "projects" && (
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase">Tech Stack (Enter to add)</label>
                                <input className={inputClassNames} value={techInput} onKeyDown={handleAddTech} onChange={(e) => setTechInput(e.target.value)} />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {techStack.map((tech, i) => (
                                        <span key={i} className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border">
                                            {tech} <button type="button" onClick={() => removeTech(i)} className="text-red-500">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase">Description</label>
                            <textarea required rows="4" className={inputClassNames} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase">Media Upload</label>
                            <input type="file" onChange={handleImage} className="text-sm cursor-pointer" />
                            {formData.image && <img src={formData.image} className="mt-2 h-20 rounded border" alt="preview" />}
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="md:col-span-2 w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition disabled:bg-gray-400">
                        {loading ? "Syncing..." : "Save Entry"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Admin;