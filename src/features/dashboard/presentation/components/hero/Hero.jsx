import { IoArrowForwardOutline } from "react-icons/io5";
import { heroStyles } from "@/features/dashboard/presentation/components/hero/HeroStyles";

const Hero = () => (
  <header className={heroStyles.header}>
    <div className={heroStyles.container}>
      <div>
        <div className={heroStyles.eyebrow}>
          <span className="h-[3px] w-10 bg-[var(--color-accent)]" />
          Software Engineering Student / Kuala Lumpur
        </div>

        <h1 className={heroStyles.title}>
          Tengku
          <span className="block text-[var(--color-accent)]">Haikal.</span>
        </h1>

        <p className="mt-8 max-w-xl border-l-4 border-[var(--color-ink)] pl-5 text-base font-black leading-relaxed text-[var(--color-muted)] sm:text-lg">
          Universiti Malaya <br /> Bachelor of Computer Science (Software Engineering)
        </p>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
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
        <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--color-white-rgb)/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-white-rgb)/0.07)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="absolute -right-14 top-16 h-7 w-64 rotate-45 bg-[var(--color-accent)]" />
        <div className="absolute -left-14 bottom-20 h-7 w-64 -rotate-45 bg-[var(--color-accent)]" />
        <div className="absolute left-6 top-6 z-100 border-2 border-[var(--color-paper-light)] bg-[var(--color-ink)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-paper-light)]">
          Profile / 001
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 w-[82%] max-w-[360px] -translate-x-1/2 -rotate-2 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-3 shadow-[7px_7px_0_var(--color-accent)] transition duration-300 hover:rotate-0 sm:bottom-10 sm:w-[74%] sm:max-w-[420px] sm:p-4 lg:bottom-12 lg:w-[64%]">
          <img src="/profile.jpg" alt="Tengku Haikal" className="aspect-[4/5] w-full border-2 border-[var(--color-ink)] object-cover grayscale transition duration-300 hover:grayscale-0" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Software Engineering</span>
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)]" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Hero;
