"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastTone = "success" | "danger" | "info" | "brand";
type ToastItem = { id: number; message: string; tone: ToastTone };

const TOAST_DURATION_MS = 2000;
const MAX_VISIBLE_TOASTS = 2;

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "border-success bg-surface text-success",
  danger: "border-danger bg-surface text-danger",
  info: "border-info bg-surface text-info",
  brand: "border-brand bg-surface text-brand",
};

const ToastContext = createContext<{
  showToast: (message: string, tone?: ToastTone) => void;
} | null>(null);

function ToastBubble({ toast }: { toast: ToastItem }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`pointer-events-auto w-full max-w-xl rounded-lg border px-4 py-3 text-lg font-medium shadow-lg transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${TONE_CLASSES[toast.tone]}`}
    >
      {toast.message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = idRef.current++;
    setToasts((prev) => {
      const next = [...prev, { id, message, tone }];
      return next.length > MAX_VISIBLE_TOASTS
        ? next.slice(next.length - MAX_VISIBLE_TOASTS)
        : next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-15 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <ToastBubble key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
