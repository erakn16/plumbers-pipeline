"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { X } from "lucide-react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  undoAction?: () => void;
};

type ToastContextType = {
  addToast: (message: string, type?: "success" | "error" | "info" | "warning", undoAction?: () => void) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "success", undoAction?: () => void) => {
      const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type, undoAction }]);
      // Auto-remove after 5 seconds
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleUndo = () => {
    if (toast.undoAction) {
      toast.undoAction();
    }
    onDismiss();
  };

  const bgClass =
    toast.type === "error"
      ? "bg-destructive text-destructive-foreground"
      : toast.type === "warning"
      ? "bg-amber-600 text-white"
      : toast.type === "info"
      ? "bg-zinc-800 text-white"
      : "bg-zinc-900 text-white";

  return (
    <div
      className={`pointer-events-auto rounded-lg px-4 py-3 shadow-lg border border-white/10 flex items-center gap-3 transition-all duration-300 ${bgClass} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      {toast.undoAction && (
        <button
          onClick={handleUndo}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="text-white/60 hover:text-white transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
