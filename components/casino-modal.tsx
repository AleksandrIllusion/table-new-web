"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { casinoFormSchema, type CasinoFormValues } from "@/lib/schemas";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { TagSelect, type TagOption } from "@/components/tag-select";
import { cx, Field, Modal } from "@/components/ui";

type Ref = { id: number; label: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
      <div className="mb-3 text-xs uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export interface CasinoModalProps {
  mode: "create" | "edit";
  casinoId?: number;
  onClose: () => void;
  onSaved: () => void;
}

export function CasinoModal({ mode, casinoId, onClose, onSaved }: CasinoModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [bonuses, setBonuses] = useState<Ref[]>([]);
  const [features, setFeatures] = useState<Ref[]>([]);
  const [payments, setPayments] = useState<Ref[]>([]);
  const [countries, setCountries] = useState<Ref[]>([]);
  const [allCodes, setAllCodes] = useState<(Ref & { country_id: number })[]>([]);

  const {
    register, handleSubmit, reset, control, watch,
    formState: { errors, isSubmitting },
  } = useForm<CasinoFormValues>({
    resolver: zodResolver(casinoFormSchema),
    defaultValues: { casino_rate: 0, bonuses: [], features: [], payments: [] },
  });

  const selectedCountry = watch("country_id");
  const logo = watch("logo_img");
  const logoOk = typeof logo === "string" && logo.startsWith("https://");
  const scopedCodes = useMemo(
    () => allCodes.filter((c) => Number(c.country_id) === Number(selectedCountry)),
    [allCodes, selectedCountry],
  );

  useEffect(() => {
    (async () => {
      try {
        const [b, f, p, c, cc] = await Promise.all([
          api<any[]>("/bonuses"), api<any[]>("/features"), api<any[]>("/payments"),
          api<any[]>("/countries"), api<any[]>("/country-codes"),
        ]);
        setBonuses(b.map((x) => ({ id: x.id, label: x.bonus })));
        setFeatures(f.map((x) => ({ id: x.id, label: x.feature })));
        setPayments(p.map((x) => ({ id: x.id, label: x.payment })));
        setCountries(c.map((x) => ({ id: x.id, label: x.country })));
        setAllCodes(cc.map((x) => ({ id: x.id, label: x.country_code, country_id: x.country_id })));

        if (mode === "edit" && casinoId) {
          const casino = await api<any>(`/casinos/${casinoId}`);
          reset({
            title: casino.title, link: casino.link, logo_img: casino.logo_img ?? "",
            casino_rate: Number(casino.casino_rate),
            country_id: casino.country_id, country_code_id: casino.country_code_id,
            bonuses: (casino.bonuses ?? []).map((x: any) => x.id),
            features: (casino.features ?? []).map((x: any) => x.id),
            payments: (casino.payments ?? []).map((x: any) => x.id),
          });
        }
      } catch (e) {
        setServerError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, casinoId, reset]);

  const onSubmit = async (values: CasinoFormValues) => {
    setServerError(null);
    try {
      if (mode === "create")
        await api("/casinos/create", { method: "POST", token: getToken(), body: JSON.stringify(values) });
      else
        await api(`/casinos/${casinoId}`, { method: "PUT", token: getToken(), body: JSON.stringify(values) });
      onSaved(); onClose();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const text = (name: keyof CasinoFormValues, label: string, type = "text") => (
    <Field label={label} error={errors[name]?.message as string}>
      <input type={type} step={type === "number" ? "0.1" : undefined} {...register(name)}
        aria-invalid={!!errors[name]} className={cx.input} />
    </Field>
  );

  return (
    <Modal title={mode === "create" ? "Add casino" : "Edit casino"} onClose={onClose}>
      {serverError && <p className={`mb-4 ${cx.errorBox}`}>{serverError}</p>}
      {loading ? (
        <p className="py-8 text-center text-neutral-400">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Section title="Casino">
            {text("title", "Title")}
            {text("link", "Casino link (https://)")}
            <div className="flex items-end gap-3">
              <div className="flex-1">{text("logo_img", "Logo URL (https://)")}</div>
              <div className="flex h-[42px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
                {logoOk
                  ? <img src={logo} alt="logo preview" className="max-h-full max-w-full object-contain" />
                  : <span className="text-[10px] text-neutral-500">logo</span>}
              </div>
            </div>
            {text("casino_rate", "Rating (0–5)", "number")}
          </Section>

          <Section title="Placement">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Country" error={errors.country_id?.message}>
                <select {...register("country_id")} className={cx.input}>
                  <option value="">—</option>
                  {countries.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
              <Field label={<>Country code {selectedCountry ? <span className="text-neutral-500">· scoped</span> : null}</>}
                error={errors.country_code_id?.message}>
                <select {...register("country_code_id")} disabled={!selectedCountry} className={cx.input}>
                  <option value="">{selectedCountry ? "—" : "Select country first"}</option>
                  {scopedCodes.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Offer">
            <Controller control={control} name="features" render={({ field }) => (
              <TagSelect label="Features" options={features} value={field.value} onChange={field.onChange}
                error={errors.features?.message}
                createPath="/features/create" createField="feature"
                onCreated={(o: TagOption) => setFeatures((s) => [...s, o])} />
            )} />
            <Controller control={control} name="bonuses" render={({ field }) => (
              <TagSelect label="Bonuses" options={bonuses} value={field.value} onChange={field.onChange}
                error={errors.bonuses?.message}
                createPath="/bonuses/create" createField="bonus"
                onCreated={(o: TagOption) => setBonuses((s) => [...s, o])} />
            )} />
            <Controller control={control} name="payments" render={({ field }) => (
              <TagSelect label="Payments" options={payments} value={field.value} onChange={field.onChange}
                error={errors.payments?.message}
                createPath="/payments/create" createField="payment"
                onCreated={(o: TagOption) => setPayments((s) => [...s, o])} />
            )} />
          </Section>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className={cx.btnGhost}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className={cx.btnPrimary}>
              {isSubmitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
