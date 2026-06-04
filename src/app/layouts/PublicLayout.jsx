const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] text-[#151513]">
      {children}
    </div>
  );
};

export default PublicLayout;
