import { IoArrowForwardOutline } from "react-icons/io5";
import { heroStyles } from "@/features/dashboard/presentation/components/hero/HeroStyles";

const Hero = () => (
  <header className={heroStyles.header}>
    <div className={heroStyles.container}>
      <div>
        <div className={heroStyles.eyebrow}>
          <span className="h-[3px] w-10 bg-[#ff5a36]" />
          Software Engineering Student / Kuala Lumpur
        </div>

        <h1 className={heroStyles.title}>
          Tengku
          <span className="block text-[#ff5a36]">Haikal.</span>
        </h1>

        <p className="mt-8 max-w-xl border-l-4 border-[#151513] pl-5 text-base font-black leading-relaxed text-[#5d5d56] sm:text-lg">
          Universiti Malaya <br /> Bachelor of Computer Science (Software Engineering)
        </p>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#5d5d56] sm:text-base">
          A curious developer who enjoys transforming ideas into real applications that people can use and benefit from.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a href="#projects" className={heroStyles.primaryLink}>
            View projects <IoArrowForwardOutline size={18} />
          </a>
          <a href="#contact" className={heroStyles.secondaryLink}>
            Start a conversation
          </a>
        </div>
      </div>

      <div className={heroStyles.panel}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="absolute -right-14 top-16 h-7 w-64 rotate-45 bg-[#ff5a36]" />
        <div className="absolute -left-14 bottom-20 h-7 w-64 -rotate-45 bg-[#ff5a36]" />
        <div className="absolute left-6 top-6 z-100 border-2 border-[#fbf8f0] bg-[#151513] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#fbf8f0]">
          Profile / 001
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 w-[82%] max-w-[360px] -translate-x-1/2 -rotate-2 border-2 border-[#151513] bg-[#fbf8f0] p-3 shadow-[7px_7px_0_#ff5a36] transition duration-300 hover:rotate-0 sm:bottom-10 sm:w-[74%] sm:max-w-[420px] sm:p-4 lg:bottom-12 lg:w-[64%]">
          <img src="/profile.jpg" alt="Tengku Haikal" className="aspect-[4/5] w-full border-2 border-[#151513] object-cover grayscale transition duration-300 hover:grayscale-0" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Software Engineering</span>
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[#151513] bg-[#ff5a36]" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Hero;
