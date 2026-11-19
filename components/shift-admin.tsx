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
  /** Stored cloaker country value; should be ISO (CY, GB) to match visitor user.country. */
  country: string;
};

/** Cloaker geolocation (`cp_geolocation`) — IDs required by /switch create & update. */
type GeoRow = {
  id: number;
  country: string;
};

/** Common ISO 3166-1 alpha-2 codes for Shift matching (ipinfo `user.country`). */
const ISO_SUGGESTIONS = [
  "GB",
  "CY",
  "US",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
  "IE",
  "AU",
  "CA",
  "NZ",
  "PT",
  "FI",
  "SE",
  "NO",
  "DK",
  "PL",
  "AT",
  "CH",
] as const;

/** Matches Nest CreateGeolocationDto: 2–10 letter ISO code (CY, GB, UK, …). */
const ISO_RE = /^[A-Za-z]{2,10}$/;

const normalizeCode = (value: string) => value.trim().toUpperCase();

/** True when value is already a code, not a legacy display name (e.g. Cyprus). */
const isIsoCode = (value: string) => ISO_RE.test(value.trim());

/** Draft value for the code field — never show uppercased display names as codes. */
const codeDraftFromStored = (stored: string) =>
  isIsoCode(stored) ? normalizeCode(stored) : "";

export function ShiftAdmin() {
  const [items, setItems] = useState<ShiftRow[]>([]);
  const [geos, setGeos] = useState<GeoRow[]>([]);
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [shiftOn, setShiftOn] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [updatingCountryId, setUpdatingCountryId] = useState<number | null>(null);
  const [draftCodes, setDraftCodes] = useState<Record<number, string>>({});

  const token = () => getToken();

  const findGeoByCode = (list: GeoRow[], code: string) =>
    list.find((g) => normalizeCode(g.country) === normalizeCode(code));

  /**
   * Persist ISO code in cp_geolocation.country so POST /switch can exact-match
   * visitor user.country (ipinfo ISO). Create geo row if missing.
   */
  const resolveGeoId = async (code: string): Promise<number> => {
    const iso = normalizeCode(code);
    const existing = findGeoByCode(geos, iso);
    if (existing) return existing.id;

    try {
      const created = await api<GeoRow>("/switch/cloaker-countries/create", {
        method: "POST",
        token: token(),
        body: JSON.stringify({ country: iso }),
      });
      setGeos((prev) => [...prev, created]);
      return created.id;
    } catch {
      const refreshed = await api<GeoRow[]>("/switch/cloaker-countries", { token: token() });
      const list = Array.isArray(refreshed) ? refreshed : [];
      setGeos(list);
      const found = findGeoByCode(list, iso);
      if (!found) throw new Error(`Could not resolve geolocation for ${iso}`);
      return found.id;
    }
  };

  const load = async () => {
    try {
      const [rows, geoList] = await Promise.all([
        api<ShiftRow[]>("/switch/get-all-cloaks", { token: token() }),
        api<GeoRow[]>("/switch/cloaker-countries", { token: token() }),
      ]);
      const nextRows = Array.isArray(rows) ? rows : [];
      setItems(nextRows);
      setGeos(Array.isArray(geoList) ? geoList : []);
      setDraftCodes(
        Object.fromEntries(nextRows.map((r) => [r.id, codeDraftFromStored(r.country)])),
      );
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
      if (Array.isArray(next)) {
        setItems(next);
        setDraftCodes(
          Object.fromEntries(next.map((r) => [r.id, codeDraftFromStored(r.country)])),
        );
      } else await load();
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

  const changeCountryCode = async (row: ShiftRow, rawCode: string) => {
    const iso = normalizeCode(rawCode);
    setDraftCodes((prev) => ({ ...prev, [row.id]: iso }));

    if (!iso) {
      // Empty blur on a legacy name row — keep field empty; do not write.
      if (!isIsoCode(row.country)) return;
      setMsg({ kind: "err", text: "Country code is required (e.g. CY, GB)" });
      setDraftCodes((prev) => ({ ...prev, [row.id]: codeDraftFromStored(row.country) }));
      return;
    }
    if (!isIsoCode(iso)) {
      setMsg({
        kind: "err",
        text: "Country code must be 2–10 letters (e.g. CY, GB) — not a display name",
      });
      return;
    }
    if (isIsoCode(row.country) && normalizeCode(row.country) === iso) return;

    setMsg(null);
    setUpdatingCountryId(row.id);
    try {
      const geoId = await resolveGeoId(iso);
      // Nest UpdateCloakCountryDto: { cloaker_id, country_id } — country_id is geolocation id
      await api<GeoRow>("/switch/update-cloak-country", {
        method: "PUT",
        token: token(),
        body: JSON.stringify({
          cloaker_id: row.id,
          country_id: geoId,
        }),
      });
      setItems((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, country: iso } : r)),
      );
      setMsg({
        kind: "ok",
        text: `Country code updated for ${row.domain} → ${iso}`,
      });
    } catch (e) {
      setDraftCodes((prev) => ({ ...prev, [row.id]: codeDraftFromStored(row.country) }));
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Country update failed" });
    } finally {
      setUpdatingCountryId(null);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const d = domain.trim().toLowerCase();
    if (!d) errs.domain = "Domain is required";
    else if (!/^(?=.{1,253}$)(?!-)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(d)) {
      errs.domain = "Domain must look like example.com";
    }
    const iso = normalizeCode(countryCode);
    if (!iso) errs.country_code = "Country code is required";
    else if (!isIsoCode(iso)) errs.country_code = "Use a 2–10 letter ISO code (e.g. CY, GB)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!validate()) return;
    const iso = normalizeCode(countryCode);
    setSaving(true);
    try {
      const geoId = await resolveGeoId(iso);
      // Nest CreateCloakDto: { domain, country_id, cloaker } — country_id is geolocation id
      await api("/switch/create", {
        method: "POST",
        token: token(),
        body: JSON.stringify({
          domain: domain.trim().toLowerCase(),
          country_id: geoId,
          cloaker: shiftOn,
        }),
      });
      setMsg({ kind: "ok", text: `Domain ${domain.trim().toLowerCase()} created (${iso}).` });
      setDomain("");
      setCountryCode("");
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
        subtitle="Set ISO country code and enable or disable shift per domain"
        action={
          <button
            onClick={() => {
              setDomain("");
              setCountryCode("");
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

      <p className="mb-3 text-sm text-neutral-400">
        Country code must match the visitor ISO from the FE (ipinfo), e.g.{" "}
        <code className="text-neutral-200">CY</code>, <code className="text-neutral-200">GB</code>
        — not display names like Cyprus.
      </p>

      <div className={`overflow-hidden ${cx.card}`}>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-neutral-400">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Domain</th>
              <th className="p-3 font-medium">Country code</th>
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
              const draft = draftCodes[row.id] ?? codeDraftFromStored(row.country);
              const legacyName = !isIsoCode(row.country) ? row.country : null;
              return (
                <tr key={row.id} className="hover:bg-white/[0.03]">
                  <td className="p-3 text-neutral-500">{row.id}</td>
                  <td className="p-3 font-medium text-white">{row.domain}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <input
                        list="shift-iso-codes"
                        value={draft}
                        maxLength={10}
                        disabled={updatingCountryId === row.id}
                        onChange={(e) =>
                          setDraftCodes((prev) => ({
                            ...prev,
                            [row.id]: e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z]/g, "")
                              .slice(0, 10),
                          }))
                        }
                        onBlur={() => changeCountryCode(row, draft)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        aria-label={`Country code for ${row.domain}`}
                        placeholder="CY"
                        className={`${cx.input} w-[5.5rem] py-1.5 text-center font-mono uppercase tracking-wider disabled:opacity-50 ${
                          legacyName ? "border-amber-500/40" : ""
                        }`}
                      />
                      {legacyName && (
                        <span className="text-[11px] text-amber-200/80">
                          was “{legacyName}” — set ISO code (exact match)
                        </span>
                      )}
                    </div>
                  </td>
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

      <datalist id="shift-iso-codes">
        {ISO_SUGGESTIONS.map((code) => (
          <option key={code} value={code} />
        ))}
      </datalist>

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
            <Field label="Country code (ISO)" error={errors.country_code}>
              <input
                list="shift-iso-codes"
                value={countryCode}
                maxLength={10}
                onChange={(e) =>
                  setCountryCode(
                    e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10),
                  )
                }
                placeholder="CY"
                aria-invalid={!!errors.country_code}
                className={`${cx.input} font-mono uppercase tracking-wider`}
              />
            </Field>
            <p className="text-xs text-neutral-500">
              Exact match to FE visitor country (e.g. CY, GB) — no display names.
            </p>
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
