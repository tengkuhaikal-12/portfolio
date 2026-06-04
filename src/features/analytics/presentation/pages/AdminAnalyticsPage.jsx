import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecentTrafficLogs } from "@/features/analytics/data/trafficLogService";
import Loading from "@/shared/components/Loading";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import PageContainer from "@/shared/layouts/PageContainer";

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value === "string" || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "-";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [authFilter, setAuthFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 200);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const records = await fetchRecentTrafficLogs(500);
        if (!mounted) return;
        setLogs(records);
      } catch (nextError) {
        if (!mounted) return;
        setError(nextError?.message || "Failed to load traffic logs");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const searchValue = debouncedSearch.trim().toLowerCase();

    return logs.filter((log) => {
      if (deviceFilter !== "all" && log.deviceType !== deviceFilter) return false;

      const isAuthenticated = Boolean(log.email || log.uid);
      if (authFilter === "authenticated" && !isAuthenticated) return false;
      if (authFilter === "anonymous" && isAuthenticated) return false;

      if (!searchValue) return true;

      const haystack = [
        log.route,
        log.path,
        log.email,
        log.uid,
        log.anonymousId,
        log.os,
        log.browser,
        log.language,
        log.timezone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchValue);
    });
  }, [logs, debouncedSearch, deviceFilter, authFilter]);

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(logs.map((log) => log.anonymousId).filter(Boolean)).size;
    const authenticatedVisits = logs.filter((log) => log.email || log.uid).length;

    return {
      total: logs.length,
      uniqueVisitors,
      authenticatedVisits,
      anonymousVisits: logs.length - authenticatedVisits,
    };
  }, [logs]);

  const latestVisitors = useMemo(() => filteredLogs.slice(0, 8), [filteredLogs]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] p-4 text-[#151513] md:p-10">
      <PageContainer className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight md:text-6xl">Traffic Analytics</h1>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-[#5d5d56]">Admin-only visitor logs</p>
          </div>
          <Link
            to="/admin"
            className="border-2 border-[#151513] bg-[#fbf8f0] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#151513] transition hover:bg-[#ff5a36]"
          >
            Back to Admin
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total visits" value={stats.total} />
          <StatCard label="Unique visitors" value={stats.uniqueVisitors} />
          <StatCard label="Authenticated" value={stats.authenticatedVisits} />
          <StatCard label="Anonymous" value={stats.anonymousVisits} />
        </div>

        <div className="space-y-4 border-2 border-[#151513] bg-[#fbf8f0] p-4 shadow-[5px_5px_0_#151513] md:p-6">
          <h2 className="text-lg font-black">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by route, email, device..."
              className="w-full border-2 border-[#151513] bg-[#f2efe7] p-3 outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
            />

            <select
              value={deviceFilter}
              onChange={(event) => setDeviceFilter(event.target.value)}
              className="w-full border-2 border-[#151513] bg-[#f2efe7] p-3 outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
            >
              <option value="all">All devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>

            <select
              value={authFilter}
              onChange={(event) => setAuthFilter(event.target.value)}
              className="w-full border-2 border-[#151513] bg-[#f2efe7] p-3 outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
            >
              <option value="all">All visitors</option>
              <option value="authenticated">Authenticated only</option>
              <option value="anonymous">Anonymous only</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 border-2 border-[#151513] bg-[#242421] p-4 text-[#fbf8f0] shadow-[5px_5px_0_#ff5a36] md:p-6">
          <h2 className="text-lg font-black">Latest Visitors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {latestVisitors.map((log) => (
              <div key={log.id} className="border-2 border-[#77756e] bg-[#2e2e2a] p-3 text-sm">
                <div className="font-black truncate">{log.email || log.uid || "Anonymous"}</div>
                <div className="text-[#aaa89f]">{log.browser} on {log.os}</div>
                <div className="text-[#aaa89f]">{log.deviceType}</div>
                <div className="truncate text-[#aaa89f]">{log.route}</div>
                <div className="text-xs text-[#aaa89f]">{formatDate(log.createdAt || log.clientTimestamp)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-[#151513] bg-[#fbf8f0] p-4 shadow-[5px_5px_0_#151513] md:p-6">
          <h2 className="text-lg font-black mb-4">Visitor Logs ({filteredLogs.length})</h2>

          {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#151513] text-left">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Identity</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Browser/OS</th>
                  <th className="py-2 pr-4">Route</th>
                  <th className="py-2 pr-4">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#d7d3c8] align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(log.createdAt || log.clientTimestamp)}</td>
                    <td className="py-2 pr-4">
                      <div>{log.email || "Anonymous"}</div>
                      <div className="text-xs text-[#5d5d56]">{log.uid || log.anonymousId || "-"}</div>
                    </td>
                    <td className="py-2 pr-4">{log.deviceType}</td>
                    <td className="py-2 pr-4">{log.browser} / {log.os}</td>
                    <td className="py-2 pr-4 break-all">{log.route}</td>
                    <td className="py-2 pr-4 text-xs text-[#5d5d56]">
                      <div>Lang: {log.language}</div>
                      <div>TZ: {log.timezone}</div>
                      <div>IP: {log.ipAddress || "not collected"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="border-2 border-[#151513] bg-[#fbf8f0] p-4 shadow-[4px_4px_0_rgba(21,21,19,0.18)]">
    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">{label}</div>
    <div className="mt-2 font-display text-4xl font-black tracking-tight text-[#ff5a36]">{value}</div>
  </div>
);

export default AdminAnalyticsPage;
