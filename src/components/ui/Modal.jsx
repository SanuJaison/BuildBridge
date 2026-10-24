import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        "input:not([type=hidden]), textarea, select, button:not([data-modal-close])"
      );
      focusable?.focus?.();
    }, 20);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink-850 shadow-2xl sm:rounded-2xl ${SIZES[size] || SIZES.md}`}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-white">
                {title}
              </h2>
              {description ? <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p> : null}
            </div>
            <button
              type="button"
              data-modal-close
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/8 bg-white/[0.02] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-300">{message}</p>
    </Modal>
  );
}
