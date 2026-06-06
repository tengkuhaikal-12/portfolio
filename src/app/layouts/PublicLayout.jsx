const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.045)_1px,transparent_1px)] [background-size:32px_32px] text-[var(--color-ink)]">
      {children}
    </div>
  );
};

export default PublicLayout;
