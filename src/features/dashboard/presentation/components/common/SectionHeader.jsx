const SectionHeader = ({ number, title, dark = false, contact = false, action = null, compact = false }) => (
  <div className={`flex shrink-0 flex-col gap-4 border-b-2 pb-5 sm:flex-row sm:items-end sm:justify-between ${dark ? "border-[#77756e]" : "border-[#151513]"}`}>
    <div className="grid items-end gap-5 sm:grid-cols-[auto_1fr]">
      <span className={`${contact ? "text-[#151513]" : "text-[#ff5a36]"} font-serif text-3xl font-black italic`}>{number}</span>
      <h2 className={`font-display font-black uppercase leading-[0.88] tracking-normal ${compact ? "text-3xl sm:text-4xl" : "text-[clamp(1.5rem,4vw,3rem)]"} ${dark ? "text-[#fbf8f0]" : "text-[#151513]"}`}>
        {title}
      </h2>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default SectionHeader;
