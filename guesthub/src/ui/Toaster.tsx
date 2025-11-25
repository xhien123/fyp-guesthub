import React from "react";

export type ToastVariant = "default" | "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type Ctx = {
  toast: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = React.createContext<Ctx | null>(null);

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster>");
  return ctx;
};

const styles: Record<ToastVariant, string> = {
  default: "bg-white text-slate-900 border-slate-200",
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
};

export const Toaster: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<Toast[]>([]);

  const remove = React.useCallback((id: string) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list, { id, ...t }]);
    window.setTimeout(() => {
      remove(id);
    }, 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast, remove }}>
      {children}
      <div className="fixed z-[9999] right-4 bottom-4 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`border rounded-xl px-4 py-3 shadow ${styles[t.variant ?? "default"]}`}
            role="status"
          >
            {t.title && <div className="font-semibold">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
