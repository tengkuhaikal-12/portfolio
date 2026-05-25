import { useTrafficTracking } from "@/features/analytics/hooks/useTrafficTracking";

const AnalyticsTracker = () => {
  useTrafficTracking();
  return null;
};

const AppProviders = ({ children }) => {
  return (
    <>
      <AnalyticsTracker />
      {children}
    </>
  );
};

export default AppProviders;
