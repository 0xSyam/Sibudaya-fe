"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "error") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.53 21H20.47A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function getToastTone(type: ToastType) {
  if (type === "success") {
    return {
      title: "Berhasil",
      card: "border-emerald-200 bg-[linear-gradient(135deg,#f4fff8_0%,#ecfdf3_100%)] text-emerald-900",
      accent: "bg-emerald-500",
      iconWrap: "bg-emerald-100 text-emerald-700",
      progress: "bg-emerald-500",
      close: "text-emerald-700 hover:bg-emerald-100",
    };
  }

  if (type === "error") {
    return {
      title: "Gagal",
      card: "border-rose-200 bg-[linear-gradient(135deg,#fff5f5_0%,#fff1f2_100%)] text-rose-900",
      accent: "bg-rose-500",
      iconWrap: "bg-rose-100 text-rose-700",
      progress: "bg-rose-500",
      close: "text-rose-700 hover:bg-rose-100",
    };
  }
 
  return {
    title: "Informasi",
    card: "border-amber-200 bg-[linear-gradient(135deg,#fffaf0_0%,#fffbeb_100%)] text-amber-900",
    accent: "bg-amber-500",
    iconWrap: "bg-amber-100 text-amber-700",
    progress: "bg-amber-500",
    close: "text-amber-700 hover:bg-amber-100",
  };
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) {
  const tone = getToastTone(toast.type);

  return (
    <div
      className={`toast-pop pointer-events-auto relative w-full overflow-hidden rounded-xl border shadow-[0_14px_36px_rgba(12,24,54,0.18)] backdrop-blur ${tone.card}`}
      role="status"
      aria-live="polite"
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} aria-hidden="true" />

      <div className="flex items-start gap-3 px-3.5 pb-3 pt-3">
        <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${tone.iconWrap}`}>
          <ToastIcon type={toast.type} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.24px] opacity-80">{tone.title}</p>
          <p className="mt-0.5 text-[13px] leading-5">{toast.message}</p>
        </div>

        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className={`shrink-0 rounded-md p-1 transition-colors ${tone.close}`}
          aria-label="Tutup notifikasi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="h-1 w-full bg-black/5" aria-hidden="true">
        <div
          className={`toast-progress h-full origin-left ${tone.progress}`}
          style={{ animationDuration: `${toast.durationMs}ms` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", durationMs = 3600) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type, durationMs }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-[min(92vw,360px)] flex-col gap-2.5 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={closeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
