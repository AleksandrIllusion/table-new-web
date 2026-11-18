"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { CasinoModal } from "@/components/casino-modal";
import { cx, PageHeader } from "@/components/ui";

type Row = { id?: number; casino_id?: number; title: string; casino_rate: number };
type Code = { id: number; country_code: string };

export default function CasinosAdminPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>(""); // "" = все казино
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null); // id казино, по которому идёт запрос
  const [modal, setModal] = useState<{ mode: "create" | "edit"; id?: number } | null>(null);

  const selectedCodeId = useMemo(
    () => codes.find((c) => c.country_code === selectedCode)?.id,
    [codes, selectedCode],
  );

  const load = async () => {
    setError(null);
    try {
      if (selectedCode) {
        // режим переупорядочивания: казино конкретного кода, по убыванию рейтинга
        const res = await api<{ data: Row[] }>(
          `/casinos/website/country_code/${encodeURIComponent(selectedCode)}?limit=100&sort=DESC`,
        );
        setRows(res.data ?? []);
      } else {
        const res = await api<{ data: Row[] }>("/casinos?limit=100&sort=DESC");
        setRows(res.data ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    (async () => {
      try { setCodes(await api<Code[]>("/country-codes")); } catch { /* пусто */ }
    })();
  }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [selectedCode]);

  const rowId = (r: Row) => (r.casino_id ?? r.id) as number;

  const reorder = async (casino_id: number, up: boolean) => {
    if (!selectedCodeId) return;
    setBusy(casino_id); setError(null);
    try {
      await api(`/casinos/rating/${selectedCodeId}`, {
        method: "PUT", token: getToken(),
        body: JSON.stringify({ casino_id, rate_update: up }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder");
    } finally {
      setBusy(null);
    }
  };

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
    if (!selectedCode) return;
    window.open(`/${selectedCode}`, "_blank", "noopener,noreferrer");
  };

  const ordering = !!selectedCode;

  return (
    <main className="px-4 py-10">
      <PageHeader title="Casinos"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-sm">
              <option value="">All casinos</option>
              {codes.map((c) => <option key={c.id} value={c.country_code}>{c.country_code}</option>)}
            </select>
            {ordering && (
              <button onClick={openPreview} className={cx.btnGhost}>Preview ↗</button>
            )}
            <button onClick={() => setModal({ mode: "create" })} className={cx.btnPrimary}>+ New casino</button>
          </div>
        } />

      {ordering && (
        <p className="mb-3 text-sm text-neutral-400">
          Reordering <span className="text-neutral-200">{selectedCode}</span> — arrows change the casino’s position (rating) on the storefront.
        </p>
      )}
      {error && <p className={`mb-4 ${cx.errorBox}`}>{error}</p>}

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-neutral-400">
            <tr>
              {ordering && <th className="p-3 font-medium">#</th>}
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Rate</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 && (
              <tr><td colSpan={ordering ? 4 : 3} className="p-6 text-center text-neutral-500">
                {ordering ? `No casinos for ${selectedCode}` : "No casinos yet"}
              </td></tr>
            )}
            {rows.map((r, i) => {
              const id = rowId(r);
              return (
                <tr key={id} className="hover:bg-white/[0.03]">
                  {ordering && <td className="p-3 text-neutral-500">{i + 1}</td>}
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.casino_rate}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {ordering && (
                        <div className="flex items-center overflow-hidden rounded-md border border-neutral-700">
                          <button
                            onClick={() => reorder(id, true)}
                            disabled={i === 0 || busy === id}
                            title="Move up"
                            className="px-2 py-1 text-neutral-200 hover:bg-neutral-800 disabled:opacity-30">↑</button>
                          <button
                            onClick={() => reorder(id, false)}
                            disabled={i === rows.length - 1 || busy === id}
                            title="Move down"
                            className="border-l border-neutral-700 px-2 py-1 text-neutral-200 hover:bg-neutral-800 disabled:opacity-30">↓</button>
                        </div>
                      )}
                      <button onClick={() => setModal({ mode: "edit", id })} className={cx.btnGhost}>Edit</button>
                      <button onClick={() => remove(id)} className={cx.btnDanger}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <CasinoModal mode={modal.mode} casinoId={modal.id} onClose={() => setModal(null)} onSaved={load} />
      )}
    </main>
  );
}
