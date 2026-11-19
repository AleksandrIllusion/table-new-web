"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { ResourceAdmin, type FieldCfg } from "@/components/resource-admin";
import { cx, Field } from "@/components/ui";

type Code = { id: number; country_code: string; country_id: number };
type Country = { id: number; country: string };

function CloneStorefront({
  codes, countries, onDone,
}: {
  codes: Code[];
  countries: Country[];
  onDone: () => void;
}) {
  const [source, setSource] = useState("");
  const [newCode, setNewCode] = useState("");
  const [countryId, setCountryId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!source || !newCode) { setMsg({ kind: "err", text: "Pick a source code and enter a new code" }); return; }
    if (!/^[A-Za-z0-9]{2,10}$/.test(newCode)) { setMsg({ kind: "err", text: "New code: 2–10 alphanumeric chars" }); return; }
    setBusy(true);
    try {
      const body: Record<string, unknown> = { source_country_code_id: Number(source), country_code: newCode };
      if (countryId) body.country_id = Number(countryId);
      const res = await api<{ casinos_copied: number; country_code: { country_code: string } }>(
        "/country-codes/clone",
        { method: "POST", token: getToken(), body: JSON.stringify(body) },
      );
      setMsg({ kind: "ok", text: `Created ${res.country_code.country_code} — copied ${res.casinos_copied} casino(s).` });
      setNewCode(""); setCountryId("");
      onDone();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to clone" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${cx.card} p-4`}>
      <h2 className="mb-1 text-sm font-semibold text-neutral-100">Duplicate storefront to a new country</h2>
      <p className="mb-3 text-xs text-neutral-400">
        Creates a new country code and copies the source code’s casino line-up (with their ratings) onto it. The storefront theme stays global.
      </p>
      {msg && <p className={`mb-3 ${msg.kind === "ok" ? cx.okBox : cx.errorBox}`}>{msg.text}</p>}
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4 sm:items-end">
        <Field label="Source code">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={cx.input}>
            <option value="">—</option>
            {codes.map((c) => <option key={c.id} value={c.id}>{c.country_code}</option>)}
          </select>
        </Field>
        <Field label="New code">
          <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. DE" className={cx.input} />
        </Field>
        <Field label="Country (optional)">
          <select value={countryId} onChange={(e) => setCountryId(e.target.value)} className={cx.input}>
            <option value="">Same as source</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.country}</option>)}
          </select>
        </Field>
        <button type="submit" disabled={busy} className={cx.btnPrimary}>{busy ? "Cloning…" : "Duplicate"}</button>
      </form>
    </div>
  );
}

export default function Page() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRefs = async () => {
    try {
      const [cs, cc] = await Promise.all([api<Country[]>("/countries"), api<Code[]>("/country-codes")]);
      setCountries(cs); setCodes(cc);
    } catch { /* пустой список */ }
  };
  useEffect(() => { (async () => { await loadRefs(); setReady(true); })(); }, []);
  if (!ready) return <main className="px-4 py-10 text-neutral-400">Loading…</main>;

  const opts = countries.map((c) => ({ value: c.id, label: c.country }));
  const fields: FieldCfg[] = [
    { name: "country_code", label: "Country code (2–10 chars)", required: true, pattern: /^[A-Za-z0-9]{2,10}$/, patternMsg: "2–10 alphanumeric chars" },
    { name: "country_id", label: "Country", type: "select", required: true, options: opts },
  ];

  const refresh = () => { loadRefs(); setRefreshKey((k) => k + 1); };

  return (
    <ResourceAdmin
      key={refreshKey}
      title="Country codes"
      listPath="/country-codes"
      createPath="/country-codes/create"
      fields={fields}
      columns={[
        { header: "Code", cell: (r) => r.country_code },
        { header: "Country", cell: (r) => countries.find((c) => c.id === r.country_id)?.country ?? "—" },
      ]}
      updatePath={(r) => `/country-codes/${r.id}`}
      deletePath={(r) => `/country-codes/${r.id}`}
      onChanged={refresh}
      extra={<CloneStorefront codes={codes} countries={countries} onDone={refresh} />}
    />
  );
}
