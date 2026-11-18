"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cx, Field, Modal, PageHeader } from "@/components/ui";

/** Domain row from Nest /switch — field name `cloaker` is the API contract. */
type ShiftRow = {
  id: number;
  domain: string;
  cloaker: boolean;
  country: string;
};

type GeoRow = {
  id: number;
  country: string;
};

export function ShiftAdmin() {
  const [items, setItems] = useState<ShiftRow[]>([]);
  const [countries, setCountries] = useState<GeoRow[]>([]);
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [countryId, setCountryId] = useState("");
  const [shiftOn, setShiftOn] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const token = () => getToken();

  const load = async () => {
    try {
      const [rows, geos] = await Promise.all([
        api<ShiftRow[]>("/switch/get-all-cloaks", { token: token() }),
        api<GeoRow[]>("/switch/cloaker-countries", { token: token() }),
      ]);
      setItems(Array.isArray(rows) ? rows : []);
      setCountries(Array.isArray(geos) ? geos : []);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed to load" });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (row: ShiftRow) => {
    setMsg(null);
    setTogglingId(row.id);
    try {
      // Nest UpdateCloakStatusDto: { id: number, cloaker: boolean }
      const next = await api<ShiftRow[]>("/switch/switch-status", {
        method: "PUT",
        token: token(),
        body: JSON.stringify({ id: row.id, cloaker: !Boolean(row.cloaker) }),
      });
      if (Array.isArray(next)) setItems(next);
      else await load();
      setMsg({
        kind: "ok",
        text: `Shift ${!row.cloaker ? "enabled" : "disabled"} for ${row.domain}`,
      });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Toggle failed" });
    } finally {
      setTogglingId(null);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const d = domain.trim().toLowerCase();
    if (!d) errs.domain = "Domain is required";
    else if (!/^(?=.{1,253}$)(?!-)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(d)) {
      errs.domain = "Domain must look like example.com";
    }
    if (!countryId) errs.country_id = "Country is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setSaving(true);
    try {
      // Nest CreateCloakDto: { domain, country_id, cloaker }
      await api("/switch/create", {
        method: "POST",
        token: token(),
        body: JSON.stringify({
          domain: domain.trim().toLowerCase(),
          country_id: Number(countryId),
          cloaker: shiftOn,
        }),
      });
      setMsg({ kind: "ok", text: `Domain ${domain.trim().toLowerCase()} created.` });
      setDomain("");
      setCountryId("");
      setShiftOn(true);
      setErrors({});
      setOpen(false);
      await load();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to create" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="px-4 py-10">
      <PageHeader
        title="Shift"
        subtitle="Enable or disable shift per domain"
        action={
          <button
            onClick={() => {
              setDomain("");
              setCountryId("");
              setShiftOn(true);
              setErrors({});
              setOpen(true);
            }}
            className={cx.btnPrimary}
          >
            + New domain
          </button>
        }
      />

      {msg && (
        <p className={`mb-4 ${msg.kind === "ok" ? cx.okBox : cx.errorBox}`}>{msg.text}</p>
      )}

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-neutral-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Domain</th>
              <th className="p-3 font-medium">Country</th>
              <th className="p-3 font-medium">Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-neutral-500">
                  No domains yet — create one to manage shift per host
                </td>
              </tr>
            )}
            {items.map((row) => {
              const on = Boolean(row.cloaker);
              return (
                <tr key={row.id} className="hover:bg-white/[0.03]">
                  <td className="p-3 text-neutral-500">{row.id}</td>
                  <td className="p-3 font-medium text-white">{row.domain}</td>
                  <td className="p-3 text-neutral-300">{row.country}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={togglingId === row.id}
                      onClick={() => toggle(row)}
                      className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                        on
                          ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                          : "border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                      }`}
                    >
                      {togglingId === row.id ? "…" : on ? "Active" : "Off"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="New shift domain" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <Field label="Domain" error={errors.domain}>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                aria-invalid={!!errors.domain}
                className={cx.input}
              />
            </Field>
            <Field label="Country" error={errors.country_id}>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                aria-invalid={!!errors.country_id}
                className={cx.input}
              >
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.country}
                  </option>
                ))}
              </select>
            </Field>
            {countries.length === 0 && (
              <p className="text-sm text-amber-200/90">
                No geolocation rows yet. Seed via{" "}
                <code className="text-xs">POST /switch/cloaker-countries/create</code>{" "}
                with <code className="text-xs">{`{ "country": "United Kingdom" }`}</code>.
              </p>
            )}
            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={shiftOn}
                onChange={(e) => setShiftOn(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              Shift enabled on create
            </label>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className={cx.btnGhost}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={cx.btnPrimary}>
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
