import React, { useEffect, useRef } from "react";
import { IoCloseOutline } from "react-icons/io5";

const ConfirmModal = ({
  isOpen,
  title = "Confirm",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => confirmButtonRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel?.();
      }}
    >
      <div className="ui-surface text-text w-full max-w-md border ui-border shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b ui-border">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest ui-muted opacity-80">
              {danger ? "Warning" : "Confirm"}
            </div>
            <h3 className="mt-1 text-lg font-black">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 grid place-items-center ui-soft border ui-border hover:opacity-90 transition"
            aria-label="Close"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm ui-muted leading-relaxed whitespace-pre-wrap">{message}</p>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 ui-soft border ui-border font-black uppercase tracking-widest text-xs hover:opacity-90 transition"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              ref={confirmButtonRef}
              onClick={onConfirm}
              className={
                danger
                  ? "px-5 py-2.5 bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:opacity-90 transition"
                  : "px-5 py-2.5 bg-text text-bg font-black uppercase tracking-widest text-xs hover:opacity-90 transition"
              }
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

