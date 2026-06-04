import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoPowerOutline } from "react-icons/io5";
import AlertModal from "@/shared/components/AlertModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createPortfolioEntry } from "@/features/admin/data/adminContentService";
import { logout } from "@/features/auth/services/authService";
import { ROUTES } from "@/shared/constants/routes";
import {
  fetchVisitorAlertSettings,
  upsertVisitorAlertWhatsappNumber,
} from "@/features/alerts/data/visitorAlertSettingsService";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Not available";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ whatsappNumber: "+60105618065" });
  const [settingsMeta, setSettingsMeta] = useState({ updatedAt: null, updatedByEmail: "" });

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

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setSettingsLoading(true);

      try {
        const settings = await fetchVisitorAlertSettings();
        if (!mounted) return;

        setSettingsForm({ whatsappNumber: settings.whatsappNumber });
        setSettingsMeta({
          updatedAt: settings.updatedAt || null,
          updatedByEmail: settings.updatedByEmail || "",
        });
      } catch (error) {
        if (!mounted) return;
        setAlertState({
          open: true,
          title: "Settings load failed",
          message: error?.message || "Unable to load visitor alert settings.",
        });
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

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

  const handleSettingsSave = async (event) => {
    event.preventDefault();

    if (authLoading) {
      setAlertState({ open: true, title: "Please wait", message: "Checking authentication... try again in a moment." });
      return;
    }

    if (!isAdmin) {
      setAlertState({ open: true, title: "Unauthorized", message: "Access denied: you are not an admin." });
      return;
    }

    setSettingsLoading(true);

    try {
      await upsertVisitorAlertWhatsappNumber(settingsForm.whatsappNumber);
      const latestSettings = await fetchVisitorAlertSettings();

      setSettingsForm({ whatsappNumber: latestSettings.whatsappNumber });
      setSettingsMeta({
        updatedAt: latestSettings.updatedAt || null,
        updatedByEmail: latestSettings.updatedByEmail || "",
      });

      setAlertState({ open: true, title: "Saved", message: "WhatsApp alert number updated successfully." });
    } catch (error) {
      console.error(error);
      setAlertState({ open: true, title: "Save failed", message: error?.message || "Failed to update WhatsApp number." });
    } finally {
      setSettingsLoading(false);
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

  const inputClassNames =
    "w-full border-2 border-[#151513] bg-[#f2efe7] p-3 outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] p-4 text-[#151513] md:p-10">
      <AlertModal
        isOpen={alertState.open}
        title={alertState.title}
        message={alertState.message}
        onClose={() => setAlertState({ open: false, title: "", message: "" })}
      />

      <div className="w-full max-w-4xl overflow-hidden border-2 border-[#151513] bg-[#fbf8f0] shadow-[8px_8px_0_#151513]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#151513] bg-[#242421] p-6 text-[#fbf8f0]">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">Portfolio Manager</h1>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.adminAnalytics}
              className="border-2 border-[#fbf8f0] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#fbf8f0] transition hover:bg-[#ff5a36] hover:text-[#151513]"
            >
              Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 border-2 border-[#fbf8f0] bg-[#d84833] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#fbf8f0] transition hover:-translate-y-0.5"
            >
              <IoPowerOutline size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto bg-[#242421]">
          {["projects", "experience", "education", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 capitalize font-bold transition border-b-4 ${
                activeTab === tab ? "border-[#151513] bg-[#ff5a36] text-[#151513]" : "border-transparent text-[#aaa89f] hover:text-[#fbf8f0]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "settings" ? (
          <form onSubmit={handleSettingsSave} className="p-8 space-y-6">
            <div className="space-y-4 border-2 border-[#151513] bg-[#f2efe7] p-5 shadow-[4px_4px_0_rgba(21,21,19,0.18)]">
              <h2 className="text-lg font-black uppercase tracking-widest">Visitor Alert Settings</h2>
              <p className="text-sm text-text/70">
                Set the admin WhatsApp number that receives first-visit alerts.
              </p>

              <div>
                <label className="block text-xs font-black text-text/70 uppercase">WhatsApp Number (E.164 format)</label>
                <input
                  required
                  type="tel"
                  className={inputClassNames}
                  placeholder="+60105618065"
                  value={settingsForm.whatsappNumber}
                  onChange={(event) => setSettingsForm({ whatsappNumber: event.target.value })}
                />
              </div>

              <div className="text-xs text-text/70 space-y-1">
                <p>Last updated: {formatDate(settingsMeta.updatedAt)}</p>
                <p>Updated by: {settingsMeta.updatedByEmail || "Not available"}</p>
              </div>
            </div>

            <button
              disabled={settingsLoading}
              type="submit"
              className="w-full border-2 border-[#151513] bg-[#ff5a36] py-4 font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-60"
            >
              {settingsLoading ? "Updating..." : "Update WhatsApp Number"}
            </button>
          </form>
        ) : (
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
                      <span key={`${tech}-${index}`} className="flex items-center gap-1 border border-[#151513] bg-[#f2efe7] px-3 py-1 text-xs font-bold">
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
                {formData.image ? <img src={formData.image} className="mt-2 h-20 border-2 border-[#151513]" alt="preview" /> : null}
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full border-2 border-[#151513] bg-[#ff5a36] py-4 font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-60 md:col-span-2"
            >
              {loading ? "Syncing..." : "Save Entry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
