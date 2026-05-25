import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppProviders from "@/app/providers/AppProviders";
import AppRouter from "@/app/router/AppRouter";
import { startVisitorSessionTracking } from "@/shared/services/visitorSessionTracker";
import "./index.css";

const App = () => {
  useEffect(() => {
    startVisitorSessionTracking({
      endpoint: "/.netlify/functions/visitor-alert",
      identity: localStorage.getItem("userEmail") || "Guest / Unknown User",
    });
  }, []);

  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
};

export default App;