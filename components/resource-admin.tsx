"use client";

import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cx, Field, Modal, PageHeader } from "@/components/ui";

export interface FieldCfg {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "select";
  required?: boolean;
  options?: { value: string | number; label: string }[];
  pattern?: RegExp;
  patternMsg?: string;
}

export function ResourceAdmin({
  title, listPath, createPath, fields, columns,
  updatePath, deletePath, extra, onChanged,
}: {
  title: string;
  listPath: string;
  createPath: string;
  fields: FieldCfg[];
  columns: { header: string; cell: (row: any) => string }[];
  /** если задан — у строк появляется Edit (PUT по этому пути) */
  updatePath?: (row: any) => string;
  /** если задан — у строк появляется Delete (DELETE по этому пути) */
  deletePath?: (row: any) => string;
  /** доп. панель под заголовком (напр. форма клонирования витрины) */
  extra?: ReactNode;
  /** вызывается после любого изменения (для синхронизации внешних данных) */
  onChanged?: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    try {
      setItems(await api<any[]>(listPath, { token: getToken() }));
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed to load" });
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openCreate = () => { setEditing(null); setForm({}); setErrors({}); setOpen(true); };
  const openEdit = (row: any) => {
    const f: Record<string, string> = {};
    for (const cfg of fields) f[cfg.name] = row[cfg.name] == null ? "" : String(row[cfg.name]);
    setEditing(row); setForm(f); setErrors({}); setOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = (form[f.name] ?? "").trim();
      if (f.required && !v) errs[f.name] = `${f.label} is required`;
      else if (v && f.pattern && !f.pattern.test(v)) errs[f.name] = f.patternMsg ?? `Invalid ${f.label}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = form[f.name];
        if (raw === undefined || raw === "") continue;
        payload[f.name] = f.type === "number" ? Number(raw) : raw;
      }
      if (editing && updatePath) {
        await api(updatePath(editing), { method: "PUT", token: getToken(), body: JSON.stringify(payload) });
        setMsg({ kind: "ok", text: "Saved." });
      } else {
        await api(createPath, { method: "POST", token: getToken(), body: JSON.stringify(payload) });
        setMsg({ kind: "ok", text: "Created." });
      }
      setForm({}); setErrors({}); setEditing(null); setOpen(false);
      await load(); onChanged?.();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: any) => {
    if (!deletePath) return;
    if (!confirm(`Delete “${columns[0]?.cell(row) ?? row.id}”?`)) return;
    setBusy(row.id); setMsg(null);
    try {
      await api(deletePath(row), { method: "DELETE", token: getToken() });
      await load(); onChanged?.();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to delete" });
    } finally {
      setBusy(null);
    }
  };

  const hasActions = !!updatePath || !!deletePath;

  return (
    <main className="px-4 py-10">
      <PageHeader title={title} action={<button onClick={openCreate} className={cx.btnPrimary}>+ New</button>} />

      {extra && <div className="mb-6">{extra}</div>}

      {msg && <p className={`mb-4 ${msg.kind === "ok" ? cx.okBox : cx.errorBox}`}>{msg.text}</p>}

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-neutral-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              {columns.map((c) => <th key={c.header} className="p-3 font-medium">{c.header}</th>)}
              {hasActions && <th className="p-3 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr><td colSpan={columns.length + 1 + (hasActions ? 1 : 0)} className="p-6 text-center text-neutral-500">No records yet</td></tr>
            )}
            {items.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-white/[0.03]">
                <td className="p-3 text-neutral-500">{row.id}</td>
                {columns.map((c) => <td key={c.header} className="p-3">{c.cell(row)}</td>)}
                {hasActions && (
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {updatePath && <button onClick={() => openEdit(row)} className={cx.btnGhost}>Edit</button>}
                      {deletePath && (
                        <button onClick={() => remove(row)} disabled={busy === row.id} className={cx.btnDanger}>
                          {busy === row.id ? "…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {fields.map((f) => (
              <Field key={f.name} label={f.label} error={errors[f.name]}>
                {f.type === "select" ? (
                  <select value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} className={cx.input}>
                    <option value="">—</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={f.type ?? "text"} value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    aria-invalid={!!errors[f.name]} className={cx.input} />
                )}
              </Field>
            ))}
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={cx.btnGhost}>Cancel</button>
              <button type="submit" disabled={saving} className={cx.btnPrimary}>{saving ? "Saving…" : editing ? "Save" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
