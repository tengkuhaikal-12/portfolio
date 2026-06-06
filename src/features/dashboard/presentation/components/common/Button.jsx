import { Link } from "react-router-dom";

const variantClasses = {
  orange: "bg-[var(--color-accent)] text-[var(--color-ink)]",
  paper: "bg-[var(--color-paper-light)] text-[var(--color-ink)]",
  dark: "bg-[var(--color-panel)] text-[var(--color-paper-light)]",
};

const Button = ({ children, to, href, variant = "orange", className = "", ...props }) => {
  const classes = `inline-flex min-h-12 touch-manipulation items-center justify-center gap-3 border-2 border-[var(--color-ink)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 ${variantClasses[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
