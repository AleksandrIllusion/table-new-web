"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface FieldCfg {
  name: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "select";
  required?: boolean;
  options?: { value: string | number; label: string }[];
  pattern?: RegExp;
  patternMsg?: string;
}

export function ReferenceAdmin({
  title,
  listPath,
  createPath,
  fields,
  display,
}: {
  title: string;
  listPath: string;
  createPath: string;
  fields: FieldCfg[];
  display: (row: any) => string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = form[f.name];
        if (raw === undefined || raw === "") continue;
        payload[f.name] = f.type === "number" ? Number(raw) : raw;
      }
      await api(createPath, { method: "POST", token: getToken(), body: JSON.stringify(payload) });
      setMsg({ kind: "ok", text: "Created." });
      setForm({});
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to create" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      {msg && (
        <p className={`mb-4 rounded-lg border p-3 ${
          msg.kind === "ok"
            ? "border-green-900 bg-green-950 text-green-200"
            : "border-red-900 bg-red-950 text-red-200"
        }`}>{msg.text}</p>
      )}

      <form onSubmit={submit} className="mb-8 flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm text-neutral-300">{f.label}</span>
            {f.type === "select" ? (
              <select
                value={form[f.name] ?? ""}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">—</option>
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                type={f.type ?? "text"}
                value={form[f.name] ?? ""}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                aria-invalid={!!errors[f.name]}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500"
              />
            )}
            {errors[f.name] && <span className="mt-1 block text-sm text-red-400">{errors[f.name]}</span>}
          </label>
        ))}
        <button type="submit" disabled={loading}
          className="mt-1 rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 disabled:opacity-50">
          {loading ? "Saving…" : "Create"}
        </button>
      </form>

      <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800">
        {items.length === 0 && <li className="p-4 text-neutral-500">Empty</li>}
        {items.map((row, i) => (
          <li key={row.id ?? i} className="flex justify-between gap-4 p-3 text-sm">
            <span className="text-neutral-500">#{row.id}</span>
            <span className="flex-1">{display(row)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
