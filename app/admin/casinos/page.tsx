"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { CasinoModal } from "@/components/casino-modal";
import { cx, PageHeader } from "@/components/ui";

type Row = { id: number; title: string; casino_rate: number };
type Code = { id: number; country_code: string };

export default function CasinosAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [previewCode, setPreviewCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number } | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await api<{ data: Row[] }>("/casinos?limit=100&sort=DESC");
      setRows(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const cc = await api<Code[]>("/country-codes");
        setCodes(cc);
        if (cc[0]) setPreviewCode(cc[0].country_code);
      } catch { /* витрину можно не предпросматривать, если кодов нет */ }
    })();
  }, []);

  const remove = async (id: number) => {
    if (!confirm("Delete this casino?")) return;
    try {
      await api(`/casinos/${id}`, { method: "DELETE", token: getToken() });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const openPreview = () => {
    if (!previewCode) return;
    // Публичный листинг /[country] — открывается в новой вкладке.
    window.open(`/${previewCode}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="px-4 py-10">
      <PageHeader title="Casinos"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select value={previewCode} onChange={(e) => setPreviewCode(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm">
              {codes.length === 0 && <option value="">—</option>}
              {codes.map((c) => <option key={c.id} value={c.country_code}>{c.country_code}</option>)}
            </select>
            <button onClick={openPreview} disabled={!previewCode} className={cx.btnGhost}>
              Preview storefront ↗
            </button>
            <button onClick={() => setModal({ mode: "create" })} className={cx.btnPrimary}>+ New casino</button>
          </div>
        } />

      {error && <p className={`mb-4 ${cx.errorBox}`}>{error}</p>}

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-left text-neutral-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Rate</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-neutral-500">No casinos yet</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-900/50">
                <td className="p-3 text-neutral-500">{r.id}</td>
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.casino_rate}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal({ mode: "edit", id: r.id })} className={cx.btnGhost}>Edit</button>
                    <button onClick={() => remove(r.id)} className={cx.btnDanger}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CasinoModal mode={modal.mode} casinoId={modal.id} onClose={() => setModal(null)} onSaved={load} />
      )}
    </main>
  );
}
