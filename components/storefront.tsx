"use client";

import type { Casino, Theme } from "@/lib/types";

function Stars({ rate, color }: { rate: number; color: string }) {
  const n = Math.max(0, Math.min(5, Math.round(rate)));
  return (
    <span style={{ color, letterSpacing: 1 }}>
      {"★".repeat(n)}<span style={{ opacity: 0.35 }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function StorefrontHeader({ theme }: { theme: Theme }) {
  return (
    <header className="rounded-2xl border p-6 text-center"
      style={{ borderColor: `${theme.accent_color}44`, background: "#0c0c0c" }}>
      {theme.logo_url && <img src={theme.logo_url} alt="" className="mx-auto mb-2 h-10 w-auto object-contain" />}
      <div style={{ fontFamily: "Aboreto, cursive", letterSpacing: 4 }}>
        <div className="text-sm" style={{ color: "#cfcfcf" }}>{theme.header_title}</div>
        <div className="text-3xl" style={{ color: theme.accent_color }}>{theme.header_brand}</div>
      </div>
      <div className="mt-1 italic" style={{ fontFamily: "'Abril Fatface', cursive", color: theme.accent_color }}>
        {theme.tagline}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {theme.pills.map((p, i) => (
          <span key={i} className="rounded-full border px-4 py-1.5 text-sm"
            style={{ borderColor: "#2a2a2a", color: "#e5e5e5" }}>{p}</span>
        ))}
      </div>
    </header>
  );
}

export function StorefrontCard({ casino, idx, theme }: { casino: Casino; idx: number; theme: Theme }) {
  const badge = theme.badges[idx];
  const primary = idx === 0;
  const btnColor = primary ? theme.button_primary : theme.button_secondary;
  const btnTextColor = primary ? "#fff" : "#111";
  const safeLink = casino.link?.startsWith("https://") ? casino.link : undefined;
  const headline = casino.bonuses[0]?.bonus;
  const sub = casino.bonuses.map((b) => b.bonus).join(" · ");
  const compact = theme.card_variant === "compact";
  const pillRadius = theme.pill_shape === "square" ? 6 : 999;
  const grad = `linear-gradient(90deg, ${theme.card_from}, ${theme.card_to})`;

  const RatingBox = (
    <div className="rounded-xl border px-5 py-2 text-center"
      style={{ borderColor: theme.accent_color, background: "linear-gradient(180deg,#1a1405,#000)" }}>
      <div className="text-3xl font-bold" style={{ color: theme.accent_color, fontFamily: "Aboreto, cursive" }}>
        {casino.casino_rate}<span className="text-sm text-neutral-400">/5</span>
      </div>
      <Stars rate={casino.casino_rate} color={theme.accent_color} />
    </div>
  );

  const Pills = (bg?: string) => (
    <div className="flex flex-wrap gap-2 px-4 py-4" style={bg ? { background: bg } : undefined}>
      {casino.features.map((f) => (
        <span key={f.id} className="border px-3 py-1.5 text-sm text-white"
          style={{ borderColor: "#ffffff33", borderRadius: pillRadius }}>⚡ {f.feature}</span>
      ))}
    </div>
  );

  const Payments = theme.show_payments && casino.payments.some((p) => p.payment_link) && (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      {casino.payments.filter((p) => p.payment_link?.startsWith("https://")).map((p) => (
        <img key={p.id} src={p.payment_link as string} alt={p.payment} className="h-5 w-auto object-contain" />
      ))}
    </div>
  );

  const Cta = (
    <div className="p-4 pt-0">
      {safeLink ? (
        <a href={safeLink} target="_blank" rel="noopener noreferrer sponsored"
          className="block rounded-full py-4 text-center text-lg font-semibold"
          style={{ background: btnColor, color: btnTextColor, fontFamily: "'Abril Fatface', cursive" }}>
          {theme.button_text} ›
        </a>
      ) : (
        <span className="block rounded-full bg-neutral-700 py-4 text-center text-neutral-300">Unavailable</span>
      )}
    </div>
  );

  return (
    <article className="relative overflow-hidden border"
      style={{ borderColor: `${theme.accent_color}55`, background: theme.bg_color, borderRadius: theme.card_radius }}>
      {/* badge — corner или bar */}
      {badge && theme.badge_style === "corner" && (
        <span className="absolute right-0 top-0 px-4 py-1.5 text-sm font-medium"
          style={{ background: theme.accent_color, color: "#111", borderBottomLeftRadius: 12 }}>{badge}</span>
      )}

      {/* top: name + rating */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          {theme.show_logo && casino.logo_img?.startsWith("https://") && (
            <img src={casino.logo_img} alt="" className="h-12 w-12 rounded-lg object-contain" />
          )}
          <div className="text-lg font-semibold text-white" style={{ fontFamily: "Aboreto, cursive" }}>
            {casino.title}
          </div>
        </div>
        {RatingBox}
      </div>

      {badge && theme.badge_style === "bar" && (
        <div className="px-4 py-2 text-sm font-medium"
          style={{ background: `${theme.accent_color}1a`, color: theme.accent_color }}>⚡ {badge}</div>
      )}

      {!compact && (
        <div className="flex items-end justify-between gap-4 px-4 pt-4" style={{ background: grad }}>
          <div>
            <div className="text-xs tracking-widest text-neutral-300">WELCOME BONUS</div>
            {headline && (
              <div className="text-4xl font-bold" style={{ color: "#fff", fontFamily: "'Abril Fatface', cursive" }}>
                {headline}
              </div>
            )}
            {sub && <div className="mt-1 text-sm text-neutral-300">{sub}</div>}
          </div>
        </div>
      )}

      {Pills(compact ? undefined : grad)}
      {Payments}
      {Cta}
    </article>
  );
}
