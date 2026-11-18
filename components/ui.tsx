"use client";

import { ReactNode } from "react";

// Единая дизайн-система админки — меняется здесь, применяется везде.
export const cx = {
  input:
    "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 aria-[invalid=true]:border-red-500/60",
  label: "mb-1.5 block text-sm font-medium text-neutral-300",
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-900/40 transition hover:bg-blue-500 active:scale-[.98] disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-neutral-200 transition hover:bg-white/[0.06] active:scale-[.98]",
  btnDanger:
    "inline-flex items-center rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10",
  card: "rounded-2xl border border-white/10 bg-white/[0.02]",
  errorBox: "rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200",
  okBox: "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200",
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mt-10 w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label="Close"
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-neutral-200">✕</button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
