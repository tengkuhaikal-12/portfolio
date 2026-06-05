import { Link } from "react-router-dom";

const variantClasses = {
  orange: "bg-[#ff5a36] text-[#151513]",
  paper: "bg-[#fbf8f0] text-[#151513]",
  dark: "bg-[#242421] text-[#fbf8f0]",
};

const Button = ({ children, to, href, variant = "orange", className = "", ...props }) => {
  const classes = `inline-flex min-h-12 touch-manipulation items-center justify-center gap-3 border-2 border-[#151513] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[4px_4px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151513] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 ${variantClasses[variant]} ${className}`;

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
