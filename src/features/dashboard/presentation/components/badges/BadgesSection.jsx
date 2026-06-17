import { useEffect } from "react";
import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";

const CREDLY_EMBED_SCRIPT_SRC = "https://cdn.credly.com/assets/utilities/embed.js";

const CredlyBadge = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.type = "text/javascript";
    script.async = true;
    script.src = CREDLY_EMBED_SCRIPT_SRC;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex min-h-[270px] justify-center">
      <div
        className="h-[270px] w-[150px]"
        data-iframe-width="150"
        data-iframe-height="270"
        data-share-badge-id="70ca6a82-d6ae-4cbf-bc0c-b24b50863e51"
        data-share-badge-host="https://www.credly.com"
      />
    </div>
  );
};

const BadgesSection = () => (
  <section
    id="badges"
    className="border-b-2 border-[var(--color-ink)] bg-[rgb(var(--color-paper-rgb)/0.9)] px-4 py-12 sm:px-6 sm:py-14"
  >
    <Container>
      <div className="flex flex-col gap-8">
        <SectionHeader number="02" title="Badges" compact />

        <CredlyBadge />
      </div>
    </Container>
  </section>
);

export default BadgesSection;
