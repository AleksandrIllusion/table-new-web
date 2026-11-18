"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { casinoFormSchema, type CasinoFormValues } from "@/lib/schemas";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { MultiSelect } from "@/components/multi-select";

type Ref = { id: number; label: string };

export default function NewCasinoPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bonuses, setBonuses] = useState<Ref[]>([]);
  const [features, setFeatures] = useState<Ref[]>([]);
  const [payments, setPayments] = useState<Ref[]>([]);
  const [countries, setCountries] = useState<Ref[]>([]);
  const [codes, setCodes] = useState<Ref[]>([]);

  const {
    register, handleSubmit, reset, control,
    formState: { errors, isSubmitting },
  } = useForm<CasinoFormValues>({
    resolver: zodResolver(casinoFormSchema),
    defaultValues: { casino_rate: 0, bonuses: [], features: [], payments: [] },
  });

  useEffect(() => {
    (async () => {
      try {
        const [b, f, p, c, cc] = await Promise.all([
          api<any[]>("/bonuses"),
          api<any[]>("/features"),
          api<any[]>("/payments"),
          api<any[]>("/countries"),
          api<any[]>("/country-codes"),
        ]);
        setBonuses(b.map((x) => ({ id: x.id, label: x.bonus })));
        setFeatures(f.map((x) => ({ id: x.id, label: x.feature })));
        setPayments(p.map((x) => ({ id: x.id, label: x.payment })));
        setCountries(c.map((x) => ({ id: x.id, label: x.country })));
        setCodes(cc.map((x) => ({ id: x.id, label: x.country_code })));
      } catch (e) {
        setServerError(e instanceof Error ? e.message : "Failed to load reference data");
      }
    })();
  }, []);

  const onSubmit = async (values: CasinoFormValues) => {
    setServerError(null); setSuccess(null);
    try {
      await api("/casinos/create", {
        method: "POST", token: getToken(), body: JSON.stringify(values),
      });
      setSuccess("Casino created.");
      reset();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to create casino");
    }
  };

  const text = (name: keyof CasinoFormValues, label: string, type = "text") => (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-300">{label}</span>
      <input
        type={type}
        step={type === "number" ? "0.1" : undefined}
        {...register(name)}
        aria-invalid={!!errors[name]}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-blue-500 aria-[invalid=true]:border-red-500"
      />
      {errors[name] && <span className="mt-1 block text-sm text-red-400">{errors[name]?.message as string}</span>}
    </label>
  );

  const select = (name: "country_id" | "country_code_id", label: string, opts: Ref[]) => (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-300">{label}</span>
      <select
        {...register(name)}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:border-blue-500"
      >
        <option value="">—</option>
        {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      {errors[name] && <span className="mt-1 block text-sm text-red-400">{errors[name]?.message as string}</span>}
    </label>
  );

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Add casino</h1>
      {serverError && <p className="mb-4 rounded-lg border border-red-900 bg-red-950 p-3 text-red-200">{serverError}</p>}
      {success && <p className="mb-4 rounded-lg border border-green-900 bg-green-950 p-3 text-green-200">{success}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {text("title", "Title")}
        {text("link", "Casino link (https://)")}
        {text("logo_img", "Logo URL (https://)")}
        {text("casino_rate", "Rating (0–5)", "number")}
        {select("country_id", "Country", countries)}
        {select("country_code_id", "Country code", codes)}

        <Controller control={control} name="bonuses" render={({ field }) => (
          <MultiSelect label="Bonuses" options={bonuses} value={field.value} onChange={field.onChange} error={errors.bonuses?.message} />
        )} />
        <Controller control={control} name="features" render={({ field }) => (
          <MultiSelect label="Features" options={features} value={field.value} onChange={field.onChange} error={errors.features?.message} />
        )} />
        <Controller control={control} name="payments" render={({ field }) => (
          <MultiSelect label="Payments" options={payments} value={field.value} onChange={field.onChange} error={errors.payments?.message} />
        )} />

        <button type="submit" disabled={isSubmitting}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium hover:bg-blue-500 disabled:opacity-50">
          {isSubmitting ? "Saving…" : "Create casino"}
        </button>
      </form>
    </main>
  );
}
