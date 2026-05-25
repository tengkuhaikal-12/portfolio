const Loading = () => {
    return (
        <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center">
            <div className="w-20 h-20 ui-surface border-4 ui-border flex flex-col items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(20,20,22,1)] animate-bounce">
                <div className="flex gap-3">
                    <div className="w-3 h-3 bg-text animate-eyes"></div>
                    <div className="w-3 h-3 bg-text animate-eyes"></div>
                </div>
                <div className="w-8 h-1 bg-text"></div>
            </div>

            <p className="mt-10 font-black uppercase tracking-tighter ui-muted opacity-80">
                Fetching...
            </p>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes eyes {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        .animate-eyes { animation: eyes 2s infinite; }
      `}} />
        </div>
    );
};

export default Loading;
