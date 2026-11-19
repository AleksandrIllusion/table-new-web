"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Theme } from "@/lib/types";
import { cx, Field, PageHeader } from "@/components/ui";
import { StorefrontHeader, StorefrontCard } from "@/components/storefront";
import { PLAY_ICONS } from "@/lib/play-icons";

const DEMO = {
  casino_id: 1, title: "Test Casino", link: "https://example.com", logo_img: null,
  casino_rate: 4.9,
  bonuses: [{ id: 1, bonus: "100% up to $750 + 50 chances" }],
  features: [{ id: 1, feature: "24/7 Support" }, { id: 2, feature: "High withdrawal limit" }, { id: 3, feature: "VIP" }],
  payments: [
    { id: 1, payment: "Visa", payment_link: "https://cdn.simpleicons.org/visa/white" },
    { id: 2, payment: "Mastercard", payment_link: "https://cdn.simpleicons.org/mastercard/white" },
    { id: 3, payment: "PayPal", payment_link: "https://cdn.simpleicons.org/paypal/white" },
  ],
};

const FONTS = ["Aboreto","Abril Fatface","Playfair Display","Cinzel","Oswald","Bebas Neue","Montserrat","Poppins","Inter"];

// Дефолты для полей, которых может не быть в старой строке темы (до миграции/деплоя).
const DEFAULTS = {
  font_heading: "Aboreto", font_body: "Inter", heading_size: 38,
  badge_position: "tr", rating_position: "right",
  button_size: "md", button_align: "center", button_full: true,
  payments_align: "left", bonus_align: "left",
  logo_anim: "none", button_anim: "none",
  button_fg: "#FFFFFF", button_fg2: "#161616",
  button_icon: "", button_icon_pos: "left", button_icon_size: 20, button_icon_anim: "none",
} as const;

export default function StorefrontThemePage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try { setTheme({ ...DEFAULTS, ...(await api<Theme>("/theme")) }); }
      catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed to load" }); }
    })();
  }, []);

  if (!theme) return <main className="px-4 py-10 text-neutral-400">Loading…</main>;

  const set = (k: keyof Theme, v: any) => setTheme({ ...theme, [k]: v });
  const list = (k: "pills" | "badges", v: string) => set(k, v.split(",").map((s) => s.trim()).filter(Boolean));

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const { id, updated_at, ...payload } = theme as Theme & { id?: number; updated_at?: string };
      const saved = await api<Theme>("/theme", { method: "PUT", token: getToken(), body: JSON.stringify(payload) });
      setTheme({ ...DEFAULTS, ...saved });
      setMsg({ kind: "ok", text: "Saved. Storefront updated." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed to save" });
    } finally { setSaving(false); }
  };

  const color = (k: keyof Theme, label: string) => (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={theme[k] as string} onChange={(e) => set(k, e.target.value)}
          className="h-9 w-12 rounded border border-neutral-700 bg-neutral-950" />
        <input value={theme[k] as string} onChange={(e) => set(k, e.target.value)} className={cx.input} />
      </div>
    </Field>
  );

  const sel = (k: keyof Theme, label: string, options: { value: string; label: string }[]) => (
    <Field label={label}>
      <select value={theme[k] as string} onChange={(e) => set(k, e.target.value)} className={cx.input}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );

  return (
    <main className="px-4 py-10">
      <PageHeader title="Storefront design"
        action={<button onClick={save} disabled={saving} className={cx.btnPrimary}>{saving ? "Saving…" : "Save"}</button>} />
      {msg && <p className={`mb-4 ${msg.kind === "ok" ? cx.okBox : cx.errorBox}`}>{msg.text}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* editor */}
        <div className="flex flex-col gap-4">
          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Header</div>
            <div className="flex flex-col gap-3">
              <Field label="Title"><input value={theme.header_title} onChange={(e) => set("header_title", e.target.value)} className={cx.input} /></Field>
              <Field label="Brand"><input value={theme.header_brand} onChange={(e) => set("header_brand", e.target.value)} className={cx.input} /></Field>
              <Field label="Tagline"><input value={theme.tagline} onChange={(e) => set("tagline", e.target.value)} className={cx.input} /></Field>
              <Field label="Logo URL"><input value={theme.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} className={cx.input} /></Field>
              <Field label="Header pills (comma-separated)"><input value={theme.pills.join(", ")} onChange={(e) => list("pills", e.target.value)} className={cx.input} /></Field>
            </div>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Colors</div>
            <div className="grid grid-cols-2 gap-3">
              {color("accent_color", "Accent / gold")}
              {color("bg_color", "Card background")}
              {color("card_from", "Gradient from")}
              {color("card_to", "Gradient to")}
              {color("button_primary", "Button (top)")}
              {color("button_secondary", "Button (rest)")}
              {color("button_fg", "Button text (top)")}
              {color("button_fg2", "Button text (rest)")}
            </div>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Card design</div>
            <div className="grid grid-cols-2 gap-3">
              {sel("card_variant", "Layout", [
                { value: "classic", label: "Classic" }, { value: "compact", label: "Compact" }, { value: "split", label: "Split" }])}
              <Field label="Corner radius">
                <input type="number" min={0} max={40} value={theme.card_radius}
                  onChange={(e) => set("card_radius", Number(e.target.value))} className={cx.input} />
              </Field>
              {sel("pill_shape", "Pill shape", [{ value: "pill", label: "Pill" }, { value: "square", label: "Square" }])}
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={theme.show_logo} onChange={(e) => set("show_logo", e.target.checked)} /> Show logo
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={theme.show_payments} onChange={(e) => set("show_payments", e.target.checked)} /> Show payments
              </label>
            </div>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Layout &amp; positions</div>
            <div className="grid grid-cols-2 gap-3">
              {sel("badge_style", "Badge style", [{ value: "bar", label: "Bar" }, { value: "corner", label: "Corner" }])}
              {sel("badge_position", "Badge corner", [
                { value: "tr", label: "Top-right" }, { value: "tl", label: "Top-left" },
                { value: "br", label: "Bottom-right" }, { value: "bl", label: "Bottom-left" }])}
              {sel("rating_position", "Rating / logo side", [
                { value: "right", label: "Rating right · logo left" },
                { value: "left", label: "Rating left · logo right" }])}
              {sel("bonus_align", "Bonus alignment", [{ value: "left", label: "Left" }, { value: "center", label: "Center" }])}
              {sel("payments_align", "Payments alignment", [
                { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }])}
              {sel("button_size", "Button size", [
                { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }])}
              {sel("button_align", "Button alignment", [
                { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }])}
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={theme.button_full} onChange={(e) => set("button_full", e.target.checked)} /> Full-width button
              </label>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Badge corner applies to the “Corner” badge style. Button alignment takes effect when “Full-width” is off.</p>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Animation</div>
            <div className="grid grid-cols-2 gap-3">
              {sel("logo_anim", "Logo animation", [
                { value: "none", label: "None" }, { value: "pulse", label: "Pulse" },
                { value: "float", label: "Float" }, { value: "spin", label: "Spin" }, { value: "glow", label: "Glow" }])}
              {sel("button_anim", "Play Now animation", [
                { value: "none", label: "None" }, { value: "pulse", label: "Pulse" },
                { value: "glow", label: "Glow" }, { value: "shine", label: "Shine" }, { value: "bounce", label: "Bounce" }])}
            </div>
            <p className="mt-2 text-xs text-neutral-500">Animated logo files (GIF/APNG/WebP) also play on their own. All effects pause under reduced-motion.</p>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Button icon</div>
            <div className="mb-3 grid grid-cols-8 gap-2">
              <button type="button" title="None" onClick={() => set("button_icon", "")}
                className="flex h-9 items-center justify-center rounded-md border text-xs text-neutral-400"
                style={{ borderColor: theme.button_icon === "" ? theme.accent_color : "#3f3f46" }}>off</button>
              {PLAY_ICONS.map((ic) => (
                <button key={ic.slug} type="button" title={ic.label} onClick={() => set("button_icon", ic.slug)}
                  className="flex h-9 items-center justify-center rounded-md border text-white"
                  style={{ borderColor: theme.button_icon === ic.slug ? theme.accent_color : "#3f3f46" }}>
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor"
                    dangerouslySetInnerHTML={{ __html: ic.svg }} />
                </button>
              ))}
            </div>
            <Field label="Custom image URL (overrides preset; GIF ok)">
              <input value={theme.button_icon.startsWith("http") ? theme.button_icon : ""}
                onChange={(e) => set("button_icon", e.target.value)} placeholder="https://…" className={cx.input} />
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {sel("button_icon_pos", "Icon position", [{ value: "left", label: "Left of text" }, { value: "right", label: "Right of text" }])}
              {sel("button_icon_anim", "Icon animation", [
                { value: "none", label: "None" }, { value: "spin", label: "Spin" },
                { value: "pulse", label: "Pulse" }, { value: "bounce", label: "Bounce" }, { value: "glow", label: "Glow" }])}
              <Field label={`Icon size (${theme.button_icon_size}px)`}>
                <input type="range" min={12} max={48} value={theme.button_icon_size}
                  onChange={(e) => set("button_icon_size", Number(e.target.value))} className="w-full" />
              </Field>
            </div>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Typography</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Heading font">
                <select value={theme.font_heading} onChange={(e) => set("font_heading", e.target.value)} className={cx.input}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Body font">
                <select value={theme.font_body} onChange={(e) => set("font_body", e.target.value)} className={cx.input}>
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label={`Headline size (${theme.heading_size}px)`}>
                <input type="range" min={20} max={64} value={theme.heading_size}
                  onChange={(e) => set("heading_size", Number(e.target.value))} className="w-full" />
              </Field>
            </div>
          </div>

          <div className={`${cx.card} p-4`}>
            <div className="mb-3 text-sm text-neutral-400">Content</div>
            <div className="flex flex-col gap-3">
              <Field label="Button text"><input value={theme.button_text} onChange={(e) => set("button_text", e.target.value)} className={cx.input} /></Field>
              <Field label="Badge titles (comma-separated, by position)"><input value={theme.badges.join(", ")} onChange={(e) => list("badges", e.target.value)} className={cx.input} /></Field>
            </div>
          </div>
        </div>

        {/* live preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-2 text-sm text-neutral-400">Live preview</div>
          <div className="rounded-2xl p-4" style={{ background: theme.bg_color }}>
            <div className="flex flex-col gap-4">
              <StorefrontHeader theme={theme} />
              <StorefrontCard casino={DEMO as any} idx={0} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
