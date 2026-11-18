"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface TagOption { id: number; label: string }

/**
 * Поисковый мультиселект с созданием «на лету».
 * Если нужного пункта нет — печатаешь название и жмёшь «+ Add», он создаётся
 * через createPath (POST) и сразу выбирается. Не нужно уходить на отдельную страницу.
 */
export function TagSelect({
  label, options, value, onChange, error,
  createPath, createField, onCreated, placeholder = "Search or add…",
}: {
  label: string;
  options: TagOption[];
  value: number[];
  onChange: (ids: number[]) => void;
  error?: string;
  createPath?: string;   // напр. "/features/create"
  createField?: string;  // напр. "feature"
  onCreated?: (opt: TagOption) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const selected = options.filter((o) => value.includes(o.id));
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return options.filter((o) => !value.includes(o.id) && (!t || o.label.toLowerCase().includes(t)));
  }, [options, value, q]);

  const exact = options.some((o) => o.label.toLowerCase() === q.trim().toLowerCase());
  const canCreate = !!createPath && !!createField && q.trim().length > 0 && !exact;

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const createNew = async () => {
    if (!canCreate) return;
    setCreating(true); setCreateErr(null);
    try {
      const body: Record<string, string> = { [createField as string]: q.trim() };
      const row = await api<any>(createPath as string, {
        method: "POST", token: getToken(), body: JSON.stringify(body),
      });
      const opt = { id: row.id, label: row[createField as string] ?? q.trim() };
      onCreated?.(opt);
      onChange([...value, opt.id]);
      setQ("");
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : "Could not add");
    } finally {
      setCreating(false);
    }
  };

  return (
    <fieldset>
      <legend className="mb-1 text-sm text-neutral-300">{label}</legend>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selected.map((o) => (
            <button type="button" key={o.id} onClick={() => toggle(o.id)}
              className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500">
              {o.label} <span aria-hidden className="opacity-70">✕</span>
            </button>
          ))}
        </div>
      )}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (canCreate) createNew(); } }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {filtered.map((o) => (
          <button type="button" key={o.id} onClick={() => toggle(o.id)}
            className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300 hover:bg-neutral-700">
            {o.label}
          </button>
        ))}
        {canCreate && (
          <button type="button" onClick={createNew} disabled={creating}
            className="rounded-full border border-dashed border-blue-500 px-3 py-1 text-sm text-blue-300 hover:bg-neutral-800 disabled:opacity-50">
            {creating ? "Adding…" : `+ Add “${q.trim()}”`}
          </button>
        )}
        {filtered.length === 0 && !canCreate && (
          <span className="text-sm text-neutral-500">
            {options.length === 0 ? "Nothing yet — type a name to add" : "No matches"}
          </span>
        )}
      </div>

      {createErr && <span className="mt-1 block text-sm text-red-400">{createErr}</span>}
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </fieldset>
  );
}
