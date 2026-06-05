import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";
import {
  aboutDescription,
  aboutDetails,
} from "@/features/dashboard/presentation/data/aboutData";

const AboutSection = () => (
  <section
    id="about"
    className="border-b-2 border-[#151513] bg-[#fbf8f0]/85 px-4 py-12 sm:px-6 sm:py-14"
  >
    <Container>
      <div className=" flex flex-col gap-7">
        <SectionHeader number="01" title="About Me" compact />

        <p className="text-sm font-bold leading-7 sm:text-base sm:leading-8">
          {aboutDescription}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {aboutDetails.map((detail) => (
            <div
              key={detail.label}
              className="flex min-w-[220px] max-w-[280px] flex-col gap-3 border-2 border-[#151513] bg-[#fbf8f0] px-5 py-5 text-center shadow-[5px_5px_0_#151513]"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff5a36]">
                {detail.label}
              </span>

              <span className="text-sm font-black leading-snug text-[#151513] sm:text-base">
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  </section>
);

export default AboutSection;
