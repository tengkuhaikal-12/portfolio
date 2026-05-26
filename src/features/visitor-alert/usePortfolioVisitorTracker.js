import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sendVisitorAlert } from "./sendVisitorAlert";

export function usePortfolioVisitorTracker(identity = "Guest") {
    const location = useLocation();

    const sessionStartRef = useRef(Date.now());
    const currentPathRef = useRef(window.location.pathname);
    const currentPathStartRef = useRef(Date.now());
    const routesRef = useRef([]);

    useEffect(() => {
        sendVisitorAlert({
            eventType: "session_start",
            identity,
            path: window.location.pathname,
            startedAt: new Date().toLocaleString(),
        });

        const handleBeforeUnload = () => {
            const now = Date.now();

            const currentPath = currentPathRef.current;
            const existingRoute = routesRef.current.find(
                (route) => route.path === currentPath
            );

            const durationMs = now - currentPathStartRef.current;

            if (existingRoute) {
                existingRoute.durationMs += durationMs;
                existingRoute.visits += 1;
            } else {
                routesRef.current.push({
                    path: currentPath,
                    durationMs,
                    visits: 1,
                });
            }

            const payload = {
                eventType: "session_end",
                identity,
                startedAt: new Date(sessionStartRef.current).toLocaleString(),
                endedAt: new Date().toLocaleString(),
                durationMs: now - sessionStartRef.current,
                routes: routesRef.current,
            };

            navigator.sendBeacon(
                "/.netlify/functions/visitor-alert",
                new Blob([JSON.stringify(payload)], {
                    type: "application/json",
                })
            );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [identity]);

    useEffect(() => {
        const now = Date.now();
        const previousPath = currentPathRef.current;
        const newPath = location.pathname;

        if (previousPath === newPath) return;

        const durationMs = now - currentPathStartRef.current;

        const existingRoute = routesRef.current.find(
            (route) => route.path === previousPath
        );

        if (existingRoute) {
            existingRoute.durationMs += durationMs;
            existingRoute.visits += 1;
        } else {
            routesRef.current.push({
                path: previousPath,
                durationMs,
                visits: 1,
            });
        }

        sendVisitorAlert({
            eventType: "route_change",
            identity,
            fromPath: previousPath,
            toPath: newPath,
            durationMs,
            timestamp: new Date().toLocaleString(),
        });

        currentPathRef.current = newPath;
        currentPathStartRef.current = now;
    }, [location.pathname, identity]);
}