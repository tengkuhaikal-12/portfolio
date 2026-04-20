import React from 'react';
import Navbar from './component/Navbar';

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-white text-black font-body selection:bg-accent selection:text-white">

      <Navbar />
      {/* --- HERO / INTRO SECTION --- */}
      <section className="mb-16 bg-brand p-8 min-h-[100vh] flex flex-col md:flex-row justify-center items-center gap-10">

        <img
          src="/profile.jpg"
          alt="profile-picture"
          className="h-40 md:h-80 w-auto object-cover border-4"
        />

        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left gap-2">

          <h1 className="font-display text-5xl md:text-8xl font-black uppercase leading-none mb-4">
            TENGKU HAIKAL
          </h1>

          <p className="font-display text-xl md:text-2xl font-bold bg-black text-white inline-block px-2 mb-6">
            UNIVERSITI MALAYA STUDENT | SOFTWARE DEVELOPER
          </p>

          <p className="font-display text-lg max-w-2xl font-bold leading-tight">
            BUILDING HIGH-PERFORMANCE WEB APPS AND TOOLS WITH A FOCUS ON
            CLEAN ARCHITECTURE AND BOLD DESIGN. CURRENTLY SPECIALIZING IN
            REACT, FLASK, AND DATA SYSTEMS.
          </p>

        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 m-16">

        {/* --- EXPERIENCE SECTION (Left Column) --- */}
        <aside className="lg:col-span-4 space-y-8" id='experience'>
          <h2 className="font-display text-3xl font-black uppercase bg-accent text-white px-4 py-1 border-4 border-black inline-block shadow-flat">
            Experience
          </h2>

          <div className="space-y-6">
            <ExperienceCard
              year="2026"
              title="Python Lead"
              org="GUAMSS Volunteerism"
              desc="Teaching high schoolers Python fundamentals and application logic."
            />
            <ExperienceCard
              year="2025"
              title="Full Stack Dev"
              org="Badan Warisan Malaysia"
              desc="Built a heritage conservation platform using React and Dicebear API."
            />
            <ExperienceCard
              year="2025"
              title="Researcher"
              org="Budi95 Analysis"
              desc="Analyzed petrol transaction efficiency using Python and Pearson correlation."
            />
          </div>

          {/* SKILLS BOX */}
          <div className="border-4 border-black p-4 bg-success shadow-flat">
            <h3 className="font-display font-black uppercase border-b-2 border-black mb-3">Tech_Stack</h3>
            <ul className="font-display font-bold text-sm grid grid-cols-2 gap-1">
              <li>{'>'} REACT</li>
              <li>{'>'} PYTHON</li>
              <li>{'>'} FLASK</li>
              <li>{'>'} C++</li>
              <li>{'>'} TAILWIND_V4</li>
              <li>{'>'} PANDAS</li>
            </ul>
          </div>
        </aside>

        {/* --- PROJECTS SECTION (Right Column) --- */}
        <main className="lg:col-span-8 space-y-8" id='projects'>
          <h2 className="font-display text-3xl font-black uppercase bg-black text-brand px-4 py-1 border-4 border-black inline-block shadow-flat">
            Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProjectCard
              title="Battlestation Rater"
              tags={["Flask", "CV", "CSS"]}
              desc="A web app that scores gaming setups using image analysis and drag-and-drop UI."
              color="bg-white"
            />
            <ProjectCard
              title="SULAM Heritage"
              tags={["React", "PostgreSQL"]}
              desc="Digital archive for Malaysian heritage sites with a brutalist dark-mode UI."
              color="bg-brand"
            />
            <ProjectCard
              title="Budi95 Tracker"
              tags={["Python", "Data"]}
              desc="Statistical tool for evaluating transaction efficiency at petrol stations."
              color="bg-accent"
            />
            <ProjectCard
              title="MITRE HSE-MWI"
              tags={["Docker", "Maintenance"]}
              desc="Refactored and containerized software maintenance repository for academic assessment."
              color="bg-success"
            />
          </div>
        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 border-t-4 border-black pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-display font-black uppercase">© 2026 // HAIKAL_DEV</p>
        <div className="flex gap-4">
          <a href="#" className="bg-black text-white px-4 py-1 font-display font-bold hover:bg-accent transition-colors">GITHUB</a>
          <a href="#" className="bg-black text-white px-4 py-1 font-display font-bold hover:bg-brand hover:text-black transition-colors">LINKEDIN</a>
        </div>
      </footer>
    </div>
  );
};

/* --- SUB-COMPONENTS FOR CLEANER CODE --- */

const ExperienceCard = ({ year, title, org, desc }) => (
  <div className="border-l-4 border-black pl-4 py-2">
    <span className="font-display font-black text-accent">{year}</span>
    <h3 className="font-display text-xl font-black uppercase">{title}</h3>
    <p className="font-bold text-sm opacity-70 mb-2">{org}</p>
    <p className="text-sm font-medium leading-tight">{desc}</p>
  </div>
);

const ProjectCard = ({ title, tags, desc, color }) => (
  <div className={`border-4 border-black ${color} p-6 shadow-flat hover:-translate-x-1 hover:-translate-y-1 hover:shadow-flat-lg transition-all cursor-crosshair`}>
    <h3 className="font-display text-2xl font-black uppercase mb-2">{title}</h3>
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map(tag => (
        <span key={tag} className="bg-black text-white text-[10px] px-2 font-bold uppercase tracking-widest">{tag}</span>
      ))}
    </div>
    <p className="text-sm font-bold leading-snug">{desc}</p>
  </div>
);

export default Portfolio;