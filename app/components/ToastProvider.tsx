"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import styles from "./ToastProvider.module.scss";

type ToastVariant = "error" | "info" | "success";

type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  timeoutMs?: number;
};

type ToastItem = {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  notify: (input: ToastInput) => void;
  clearToasts: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<number[]>([]);
  const idRef = useRef(0);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setToasts([]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, variant = "info", timeoutMs = 4200 }: ToastInput) => {
      const id = ++idRef.current;
      const nextToast: ToastItem = {
        id,
        title:
          title ||
          (variant === "success"
            ? "Success"
            : variant === "info"
              ? "Heads up"
              : "Something went wrong"),
        message,
        variant,
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));

      const timer = window.setTimeout(() => {
        removeToast(id);
      }, timeoutMs);

      timersRef.current.push(timer);
    },
    [removeToast],
  );

  useEffect(() => () => clearToasts(), [clearToasts]);

  const value = useMemo(() => ({ notify, clearToasts }), [notify, clearToasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.stack} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[`toast_${toast.variant}`]}`}
          >
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
            <button
              type="button"
              className={styles.dismiss}
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
