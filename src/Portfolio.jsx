import React from 'react';
import Navbar from './component/Navbar';

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body">

      <Navbar />

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28">
        <img
          src="/profile.jpg"
          alt="profile"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md mb-6"
        />

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Tengku Haikal
        </h1>

        <p className="text-gray-500 mb-6">
          Universiti Malaya Student • Software Developer
        </p>

        <p className="max-w-xl text-gray-600">
          Building clean, high-performance applications with focus on
          modern UI and scalable architecture.
        </p>
      </section>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-20">

        {/* EXPERIENCE */}
        <section id="experience" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold mb-6">Experience</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <ExperienceCard
              year="2026"
              title="MathsTech Tuition"
              org="Volunteerism"
              desc="Teaching high school students Python fundamentals."
            />
            <ExperienceCard
              year="2025"
              title="SULAM Heritage Platform"
              org="Badan Warisan Malaysia"
              desc="Built a React-based heritage conservation platform."
            />
            <ExperienceCard
              year="2025"
              title="Researcher"
              org="Budi95 Analysis"
              desc="Analyzed petrol transaction efficiency using Python."
            />
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold mb-6">Projects</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <ProjectCard
              title="Battlestation Rater"
              tags={["React", "Tailwind"]}
              desc="Scores gaming setups using UI + image analysis."
            />
            <ProjectCard
              title="SULAM Heritage"
              tags={["React"]}
              desc="Digital archive for Malaysian heritage sites."
            />
            <ProjectCard
              title="Budi95 Tracker"
              tags={["Python", "Data"]}
              desc="Tool for evaluating transaction efficiency."
            />
            <ProjectCard
              title="MITRE HSE-MWI"
              tags={["Docker"]}
              desc="Containerized software maintenance system."
            />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="scroll-mt-28 text-center">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>

          <p className="text-gray-600 mb-6">
            Let’s build something together.
          </p>

          <div className="flex justify-center gap-4">
            <a href="#" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              GitHub
            </a>
            <a href="#" className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
              LinkedIn
            </a>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 border-t">
        © 2026 Tengku Haikal
      </footer>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

const ExperienceCard = ({ year, title, org, desc }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <span className="text-sm text-gray-400">{year}</span>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-gray-500 mb-2">{org}</p>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const ProjectCard = ({ title, tags, desc }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>

    <div className="flex flex-wrap gap-2 mb-3">
      {tags.map(tag => (
        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
          {tag}
        </span>
      ))}
    </div>

    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

export default Portfolio;