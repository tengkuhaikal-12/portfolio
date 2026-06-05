import {
  IoArrowForwardOutline,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLocationOutline,
} from "react-icons/io5";
import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";

const ContactField = ({ label, children }) => (
  <label className="flex flex-col gap-2">
    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5d5d56]">{label}</span>
    {children}
  </label>
);

const ContactRow = ({ icon, label, value, href }) => (
  <div className="flex items-center gap-4 border-2 border-[#77756e] p-4 transition hover:border-[#ff5a36]">
    <div className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#fbf8f0] bg-[#ff5a36] text-[#151513]">{icon}</div>
    <div className="min-w-0">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#aaa89f]">{label}</div>
      {href ? (
        <a
          className="break-words text-sm font-black text-[#fbf8f0] decoration-[#ff5a36] decoration-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {value}
        </a>
      ) : (
        <div className="break-words text-sm font-black text-[#fbf8f0]">{value}</div>
      )}
    </div>
  </div>
);

const ContactSection = ({ contactForm, contactStatus, onChange, onSubmit }) => (
  <section id="contact" className="border-b-2 border-[#151513] bg-[#ff5a36] px-4 py-16 sm:px-6 sm:py-20">
    <Container>
      <SectionHeader number="05" title="Contact" contact />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border-2 border-[#151513] bg-[#242421] p-5 text-[#fbf8f0] shadow-[7px_7px_0_#151513] sm:p-8">
          <p className="mb-6 max-w-md text-sm leading-7 text-[#c7c5bd] sm:mb-8">
            Want to collaborate or have a question? Send a message or reach me via the links below.
          </p>

          <div className="flex flex-col gap-4">
            <ContactRow
              icon={<IoLogoLinkedin size={18} />}
              label="LinkedIn"
              value="linkedin.com"
              href="https://www.linkedin.com/in/tengku-haikal-tengku-abdullah-651769291/"
            />
            <ContactRow
              icon={<IoLogoGithub size={18} />}
              label="GitHub"
              value="github.com"
              href="https://github.com/tengkuhaikal"
            />
            <ContactRow
              icon={<IoLocationOutline size={18} />}
              label="Location"
              value="Kuala Lumpur, MY"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="border-2 border-[#151513] bg-[#fbf8f0] p-5 shadow-[7px_7px_0_#151513] sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div className="hidden" aria-hidden="true">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-[#5d5d56]">Website</label>
              <input
                value={contactForm.website}
                onChange={onChange("website")}
                autoComplete="off"
                tabIndex={-1}
                className="w-full border-2 border-[#151513] bg-transparent px-4 py-3"
                placeholder="https://"
              />
            </div>

            <ContactField label="Name">
              <input
                value={contactForm.name}
                onChange={onChange("name")}
                className="w-full border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
                placeholder="Your name"
                autoComplete="name"
              />
            </ContactField>

            <ContactField label="Email">
              <input
                value={contactForm.email}
                onChange={onChange("email")}
                className="w-full border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
            </ContactField>

            <ContactField label="Message">
              <textarea
                value={contactForm.message}
                onChange={onChange("message")}
                className="min-h-[6rem] w-full resize-y border-2 border-[#151513] bg-[#f2efe7] px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 sm:min-h-[8rem]"
                placeholder="Email me a message"
              />
            </ContactField>

            <button
              type="submit"
              disabled={contactStatus.state === "loading"}
              className="inline-flex min-h-12 w-full items-center justify-between border-2 border-[#151513] bg-[#ff5a36] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {contactStatus.state === "loading" ? "Sending..." : "Send"} <IoArrowForwardOutline size={18} />
            </button>

            {contactStatus.state === "success" ? <p className="border-l-4 border-[#36a166] pl-3 text-xs font-bold text-[#246f46]">{contactStatus.message}</p> : null}
            {contactStatus.state === "error" ? <p className="border-l-4 border-[#d84833] pl-3 text-xs font-bold text-[#d84833]">{contactStatus.message}</p> : null}
          </div>
        </form>
      </div>
    </Container>
  </section>
);

export default ContactSection;
