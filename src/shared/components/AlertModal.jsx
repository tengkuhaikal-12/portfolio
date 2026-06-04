import React from "react";
import { IoCloseOutline } from "react-icons/io5";

const AlertModal = ({ isOpen, title = "Notice", message = "", onClose, primaryLabel = "OK" }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[#151513]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-md border-2 border-[#151513] bg-[#fbf8f0] text-[#151513] shadow-[8px_8px_0_#ff5a36]">
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#151513] p-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff5a36]">Alert</div>
            <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center border-2 border-[#151513] bg-[#f2efe7] shadow-[2px_2px_0_#151513] transition hover:bg-[#ff5a36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
            aria-label="Close"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#5d5d56]">{message}</p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-[#151513] bg-[#ff5a36] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#151513] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151513] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36]"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
