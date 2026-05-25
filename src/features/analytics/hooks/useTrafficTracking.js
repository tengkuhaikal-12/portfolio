import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { logTrafficVisit } from "@/features/analytics/data/trafficLogService";

export function useTrafficTracking() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const lastRouteRef = useRef("");

  useEffect(() => {
    if (loading) return;

    const nextRoute = `${location.pathname}${location.search || ""}`;

    if (nextRoute === lastRouteRef.current) return;
    lastRouteRef.current = nextRoute;

    logTrafficVisit({
      pathname: location.pathname,
      search: location.search,
      user,
    });
  }, [loading, location.pathname, location.search, user]);
}
