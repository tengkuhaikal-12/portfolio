const Loading = () => {
    return (
        <div className="min-h-screen bg-[#f2efe7] bg-[linear-gradient(rgba(21,21,19,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.045)_1px,transparent_1px)] [background-size:32px_32px] text-[#151513] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#ff5a36] border-4 border-[#151513] flex flex-col items-center justify-center gap-3 shadow-[6px_6px_0_#151513] animate-bounce">
                <div className="flex gap-3">
                    <div className="w-3 h-3 bg-[#151513] animate-pulse"></div>
                    <div className="w-3 h-3 bg-[#151513] animate-pulse"></div>
                </div>
                <div className="w-8 h-1 bg-[#151513]"></div>
            </div>

            <p className="mt-10 font-black uppercase tracking-[0.16em] text-[#5d5d56]">
                Fetching...
            </p>
        </div>
    );
};

export default Loading;
