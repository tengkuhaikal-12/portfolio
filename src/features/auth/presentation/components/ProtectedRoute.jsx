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
      <div className="flex h-screen flex-col items-center justify-center bg-[#242421] px-6 text-center text-[#fbf8f0]">
        <h1 className="border-2 border-[#fbf8f0] bg-[#ff5a36] px-6 py-4 font-display text-3xl font-black uppercase tracking-tight text-[#151513] shadow-[6px_6px_0_#fbf8f0]">Checking access...</h1>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[#aaa89f]">Please wait.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#242421] px-6 text-center text-[#fbf8f0]">
        <h1 className="border-2 border-[#fbf8f0] bg-[#d84833] px-6 py-4 font-display text-3xl font-black uppercase tracking-tight shadow-[6px_6px_0_#fbf8f0]">Access denied (Admin only)</h1>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[#aaa89f]">
          Redirecting to home in <span className="font-bold text-[#ff5a36]">{time}</span> s...
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
