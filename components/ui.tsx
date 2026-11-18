"use client";

import { ReactNode } from "react";

// Единые классы — одна правда для всех экранов.
export const cx = {
  input:
    "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500 disabled:opacity-50",
  label: "mb-1 block text-sm text-neutral-300",
  btnPrimary:
    "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50",
  btnGhost:
    "rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800",
  btnDanger:
    "rounded-md border border-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-950",
  card: "rounded-xl border border-neutral-800 bg-neutral-900",
  errorBox: "rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200",
  okBox: "rounded-lg border border-green-900 bg-green-950 p-3 text-sm text-green-200",
};

export function Field({
  label, error, children,
}: { label: ReactNode; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={cx.label}>{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </label>
  );
}

export function Modal({
  title, onClose, children, footer,
}: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="mt-10 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close"
            className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-neutral-800">✕</button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function PageHeader({
  title, action,
}: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {action}
    </div>
  );
}
