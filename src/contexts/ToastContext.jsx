import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONES = {
  success: "text-mint-400",
  error: "text-rose-400",
  warning: "text-amber-300",
  info: "text-sky-300",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (type, title, message = "") => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current.slice(-3), { id, type, title, message }]);
      timers.current.set(
        id,
        setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
          timers.current.delete(id);
        }, 5200)
      );
      return id;
    },
    []
  );

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (title, message) => push("success", title, message),
      error: (title, message) => push("error", title, message),
      warning: (title, message) => push("warning", title, message),
      info: (title, message) => push("info", title, message),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className="glass pointer-events-auto flex w-full items-start gap-3 rounded-xl p-4 shadow-2xl"
              style={{ animation: "toast-in 220ms ease-out" }}
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${TONES[toast.type] || TONES.info}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
