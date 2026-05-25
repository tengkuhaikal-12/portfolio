import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoPowerOutline } from "react-icons/io5";
import AlertModal from "@/shared/components/AlertModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createPortfolioEntry } from "@/features/admin/data/adminContentService";
import { logout } from "@/features/auth/services/authService";
import { ROUTES } from "@/shared/constants/routes";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });

  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [alertState, setAlertState] = useState({ open: false, title: "", message: "" });

  const [techInput, setTechInput] = useState("");
  const [techStack, setTechStack] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, index) => currentYear - index);

  const [startMonth, setStartMonth] = useState("Jan");
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endMonth, setEndMonth] = useState("Jan");
  const [endYear, setEndYear] = useState("Present");

  const handleAddTech = (event) => {
    if (event.key !== "Enter" && event.key !== ",") return;

    event.preventDefault();
    const value = techInput.trim().replace(/,/g, "");
    if (value && !techStack.includes(value)) {
      setTechStack([...techStack, value]);
    }
    setTechInput("");
  };

  const removeTech = (indexToRemove) => {
    setTechStack(techStack.filter((_, index) => index !== indexToRemove));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setFormData((prev) => ({ ...prev, image: reader.result }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (authLoading) {
      setAlertState({ open: true, title: "Please wait", message: "Checking authentication... try again in a moment." });
      return;
    }

    if (!isAdmin) {
      setAlertState({ open: true, title: "Unauthorized", message: "Access denied: you are not an admin." });
      return;
    }

    setLoading(true);

    try {
      const startMonthIdx = MONTHS.indexOf(startMonth);
      const sortValue = Number.parseInt(startYear, 10) * 12 + startMonthIdx;

      const duration =
        endYear === "Present"
          ? `${startMonth} ${startYear} - Present`
          : `${startMonth} ${startYear} - ${endMonth} ${endYear}`;

      await createPortfolioEntry(activeTab, {
        ...formData,
        duration,
        sortDate: sortValue,
        techStack: activeTab === "projects" ? techStack : [],
      });

      setAlertState({ open: true, title: "Saved", message: `Successfully added to ${activeTab}.` });
      setFormData({ title: "", subtitle: "", description: "", image: "" });
      setTechStack([]);
      setTechInput("");
    } catch (error) {
      console.error(error);
      setAlertState({ open: true, title: "Save failed", message: error?.message || "Error saving data" });
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { tab: "projects", title: "Project Name", role: "Role/Position" },
    { tab: "experience", title: "Job Title", role: "Company/Organization" },
    { tab: "education", title: "Programme", role: "Institution" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.home);
  };

  const inputClassNames = "w-full p-3 ui-soft border-2 ui-border focus:border-text outline-none transition";

  return (
    <div className="min-h-screen bg-bg text-text p-4 md:p-10 flex justify-center items-center">
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ open: false, title: "", message: "" })}
      />

      <div className="max-w-4xl w-full ui-surface border ui-border shadow-2xl overflow-hidden">
        <div className="bg-ink p-6 text-paper flex justify-between items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-widest uppercase">Portfolio Manager</h1>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.adminAnalytics}
              className="border border-paper/20 px-4 py-2 text-paper text-sm font-black uppercase tracking-widest"
            >
              Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="bg-danger text-paper px-4 py-2 flex items-center gap-2 cursor-pointer hover:opacity-90 transition border border-paper/15"
            >
              <IoPowerOutline size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="flex bg-ink border-t border-paper/10">
          {["projects", "experience", "education"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 capitalize font-bold transition border-b-4 ${
                activeTab === tab ? "bg-paper text-ink border-ink" : "text-paper/70 border-transparent hover:text-paper"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-text/70 uppercase">
                {inputFields.find((field) => field.tab === activeTab)?.title}
              </label>
              <input
                required
                className={inputClassNames}
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-text/70 uppercase">
                {inputFields.find((field) => field.tab === activeTab)?.role}
              </label>
              <input
                required
                className={inputClassNames}
                value={formData.subtitle}
                onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-text/70 uppercase">Start Date</label>
              <div className="flex gap-2">
                <select className={inputClassNames} value={startMonth} onChange={(event) => setStartMonth(event.target.value)}>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select className={inputClassNames} value={startYear} onChange={(event) => setStartYear(event.target.value)}>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <label className="block text-xs font-black text-text/70 uppercase">End Date</label>
              <div className="flex gap-2">
                <select className={inputClassNames} value={endMonth} onChange={(event) => setEndMonth(event.target.value)}>
                  {MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select className={inputClassNames} value={endYear} onChange={(event) => setEndYear(event.target.value)}>
                  <option value="Present">Present</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {activeTab === "projects" ? (
              <div>
                <label className="block text-xs font-black text-text/70 uppercase">Tech Stack (Enter to add)</label>
                <input
                  className={inputClassNames}
                  value={techInput}
                  onKeyDown={handleAddTech}
                  onChange={(event) => setTechInput(event.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {techStack.map((tech, index) => (
                    <span key={`${tech}-${index}`} className="ui-pill border px-3 py-1 text-xs font-bold flex items-center gap-1">
                      {tech}
                      <button type="button" onClick={() => removeTech(index)} className="text-red-500">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-black text-text/70 uppercase">Description</label>
              <textarea
                required
                rows="4"
                className={inputClassNames}
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-text/70 uppercase">Media Upload</label>
              <input type="file" onChange={handleImage} className="text-sm cursor-pointer" />
              {formData.image ? <img src={formData.image} className="mt-2 h-20 border ui-border" alt="preview" /> : null}
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="md:col-span-2 w-full bg-text text-bg py-4 font-black uppercase tracking-widest hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Syncing..." : "Save Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
