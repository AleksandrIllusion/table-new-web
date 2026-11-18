"use client";

import { useEffect, useState } from "react";
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
}: {
  title: string;
  listPath: string;
  createPath: string;
  fields: FieldCfg[];
  columns: { header: string; cell: (row: any) => string }[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setItems(await api<any[]>(listPath, { token: getToken() }));
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed to load" });
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

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
      await api(createPath, { method: "POST", token: getToken(), body: JSON.stringify(payload) });
      setMsg({ kind: "ok", text: "Created." });
      setForm({}); setErrors({}); setOpen(false);
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to create" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="px-4 py-10">
      <PageHeader title={title}
        action={<button onClick={() => { setForm({}); setErrors({}); setOpen(true); }} className={cx.btnPrimary}>+ New</button>} />

      {msg && <p className={`mb-4 ${msg.kind === "ok" ? cx.okBox : cx.errorBox}`}>{msg.text}</p>}

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-left text-neutral-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              {columns.map((c) => <th key={c.header} className="p-3 font-medium">{c.header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {items.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="p-6 text-center text-neutral-500">No records yet</td></tr>
            )}
            {items.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-neutral-900/50">
                <td className="p-3 text-neutral-500">{row.id}</td>
                {columns.map((c) => <td key={c.header} className="p-3">{c.cell(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={`New ${title.toLowerCase()}`} onClose={() => setOpen(false)}>
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
              <button type="submit" disabled={saving} className={cx.btnPrimary}>{saving ? "Saving…" : "Create"}</button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
