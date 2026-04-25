import React from 'react';

const Loading = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white border-4 border-black rounded-2xl flex flex-col items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                <div className="flex gap-3">
                    <div className="w-3 h-3 bg-black rounded-full animate-eyes"></div>
                    <div className="w-3 h-3 bg-black rounded-full animate-eyes"></div>
                </div>
                <div className="w-8 h-1 bg-black rounded-full"></div>
            </div>

            <p className="mt-10 font-black uppercase tracking-tighter text-gray-400">
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