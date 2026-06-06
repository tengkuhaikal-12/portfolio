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
      className="fixed inset-0 z-[250] flex items-center justify-center bg-[rgb(var(--color-ink-rgb)/0.8)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel?.();
      }}
    >
      <div className="w-full max-w-md border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[8px_8px_0_var(--color-accent)]">
        <div className="flex items-start justify-between gap-4 border-b-2 border-[var(--color-ink)] p-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-accent)]">
              {danger ? "Warning" : "Confirm"}
            </div>
            <h3 className="mt-2 font-display text-2xl font-black uppercase tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper)] shadow-[2px_2px_0_var(--color-ink)] transition hover:bg-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-muted)]">{message}</p>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="border-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              ref={confirmButtonRef}
              onClick={onConfirm}
              className={
                danger
                  ? "border-2 border-[var(--color-ink)] bg-[var(--color-danger)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-paper-light)] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  : "border-2 border-[var(--color-ink)] bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_var(--color-ink)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
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
