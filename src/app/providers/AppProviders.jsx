import { useTrafficTracking } from "@/features/analytics/hooks/useTrafficTracking";
import { useVisitorWhatsappAlert } from "@/features/alerts/hooks/useVisitorWhatsappAlert";

const AnalyticsTracker = () => {
  useTrafficTracking();
  return null;
};

const VisitorAlertTracker = () => {
  useVisitorWhatsappAlert();
  return null;
};

const AppProviders = ({ children }) => {
  return (
    <>
      <AnalyticsTracker />
      <VisitorAlertTracker />
      {children}
    </>
  );
};

export default AppProviders;
