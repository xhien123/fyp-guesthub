import React from "react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmState =
  | { open: false }
  | { open: true; opts: ConfirmOptions; resolve: (v: boolean) => void };

const ConfirmContext = React.createContext<{
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
} | null>(null);

export const useConfirm = () => {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used under <ConfirmRoot/>");
  return ctx.confirm;
};

type Props = { children?: React.ReactNode };

export const ConfirmRoot: React.FC<Props> = ({ children }) => {
  const [state, setState] = React.useState<ConfirmState>({ open: false });

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  const close = (value: boolean) => {
    if (state.open) state.resolve(value);
    setState({ open: false });
  };

  // Always portal a root container so our “is it mounted?” check can find it.
  const portal = createPortal(
    <div data-confirm-root>
      {state.open && (
        <div
          className="fixed inset-0 z-[9998] grid place-items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => close(false)}
            aria-hidden="true"
          />
          <div className="relative z-[9999] w-full max-w-sm rounded-2xl bg-white border p-5 shadow-lg">
            <div id="confirm-title" className="font-medium mb-1">
              {state.opts.title ?? "Are you sure?"}
            </div>
            <div className="text-sm text-neutral-700 mb-4">
              {state.opts.message ?? "This action cannot be undone."}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded border hover:bg-neutral-50"
                onClick={() => close(false)}
              >
                {state.opts.cancelText ?? "Cancel"}
              </button>
              <button
                className="px-3 py-1.5 rounded bg-black text-white"
                onClick={() => close(true)}
                autoFocus
              >
                {state.opts.confirmText ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {portal}
      {children}
    </ConfirmContext.Provider>
  );
};
