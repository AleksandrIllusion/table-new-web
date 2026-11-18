"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ResourceAdmin, type FieldCfg } from "@/components/resource-admin";

export default function Page() {
  const [opts, setOpts] = useState<{ value: number; label: string }[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      try { const c = await api<any[]>("/countries"); setOpts(c.map((x) => ({ value: x.id, label: x.country }))); }
      catch { /* пустой список */ }
      setReady(true);
    })();
  }, []);
  if (!ready) return <main className="px-4 py-10 text-neutral-400">Loading…</main>;

  const fields: FieldCfg[] = [
    { name: "country_code", label: "Country code (2–10 chars)", required: true, pattern: /^[A-Za-z0-9]{2,10}$/, patternMsg: "2–10 alphanumeric chars" },
    { name: "country_id", label: "Country", type: "select", required: true, options: opts },
  ];
  return <ResourceAdmin title="Country codes" listPath="/country-codes" createPath="/country-codes/create"
    fields={fields} columns={[{ header: "Code", cell: (r) => r.country_code }]} />;
}
