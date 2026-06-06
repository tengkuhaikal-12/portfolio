import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(5);

  useEffect(() => {
    if (!loading && !isAdmin) {
      const interval = setInterval(() => {
        setTime((value) => value - 1);
      }, 1000);

      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--color-panel)] px-6 text-center text-[var(--color-paper-light)]">
        <h1 className="border-2 border-[var(--color-paper-light)] bg-[var(--color-accent)] px-6 py-4 font-display text-3xl font-black uppercase tracking-tight text-[var(--color-ink)] shadow-[6px_6px_0_var(--color-paper-light)]">Checking access...</h1>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-muted-light)]">Please wait.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--color-panel)] px-6 text-center text-[var(--color-paper-light)]">
        <h1 className="border-2 border-[var(--color-paper-light)] bg-[var(--color-danger)] px-6 py-4 font-display text-3xl font-black uppercase tracking-tight shadow-[6px_6px_0_var(--color-paper-light)]">Access denied (Admin only)</h1>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-muted-light)]">
          Redirecting to home in <span className="font-bold text-[var(--color-accent)]">{time}</span> s...
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
