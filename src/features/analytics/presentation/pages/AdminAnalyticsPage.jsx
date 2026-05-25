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
    <div className="min-h-screen bg-bg text-text p-4 md:p-10">
      <PageContainer className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Traffic Analytics</h1>
            <p className="ui-muted text-sm">Admin-only visitor logs</p>
          </div>
          <Link
            to="/admin"
            className="px-4 py-2 border ui-border ui-soft font-black text-sm uppercase tracking-widest"
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

        <div className="ui-surface border ui-border p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-black">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by route, email, device..."
              className="w-full p-3 ui-soft border ui-border"
            />

            <select
              value={deviceFilter}
              onChange={(event) => setDeviceFilter(event.target.value)}
              className="w-full p-3 ui-soft border ui-border"
            >
              <option value="all">All devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>

            <select
              value={authFilter}
              onChange={(event) => setAuthFilter(event.target.value)}
              className="w-full p-3 ui-soft border ui-border"
            >
              <option value="all">All visitors</option>
              <option value="authenticated">Authenticated only</option>
              <option value="anonymous">Anonymous only</option>
            </select>
          </div>
        </div>

        <div className="ui-surface border ui-border p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-black">Latest Visitors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {latestVisitors.map((log) => (
              <div key={log.id} className="border ui-border ui-soft p-3 text-sm">
                <div className="font-black truncate">{log.email || log.uid || "Anonymous"}</div>
                <div className="ui-muted">{log.browser} on {log.os}</div>
                <div className="ui-muted">{log.deviceType}</div>
                <div className="ui-muted truncate">{log.route}</div>
                <div className="ui-muted text-xs">{formatDate(log.createdAt || log.clientTimestamp)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ui-surface border ui-border p-4 md:p-6">
          <h2 className="text-lg font-black mb-4">Visitor Logs ({filteredLogs.length})</h2>

          {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b ui-border text-left">
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
                  <tr key={log.id} className="border-b ui-border align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(log.createdAt || log.clientTimestamp)}</td>
                    <td className="py-2 pr-4">
                      <div>{log.email || "Anonymous"}</div>
                      <div className="ui-muted text-xs">{log.uid || log.anonymousId || "-"}</div>
                    </td>
                    <td className="py-2 pr-4">{log.deviceType}</td>
                    <td className="py-2 pr-4">{log.browser} / {log.os}</td>
                    <td className="py-2 pr-4 break-all">{log.route}</td>
                    <td className="py-2 pr-4 text-xs ui-muted">
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
  <div className="ui-surface border ui-border p-4">
    <div className="text-xs uppercase tracking-widest ui-muted font-black">{label}</div>
    <div className="text-2xl font-black mt-2">{value}</div>
  </div>
);

export default AdminAnalyticsPage;
