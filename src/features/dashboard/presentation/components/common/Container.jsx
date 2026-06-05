const Container = ({ children, className = "" }) => {
  return <div className={`mx-auto max-w-7xl ${className}`}>{children}</div>;
};

export default Container;
