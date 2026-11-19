"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Casino, Theme } from "@/lib/types";
import { PLAY_ICON_MAP } from "@/lib/play-icons";

const ff = (name: string) => `"${name}", serif`;

function Stars({ rate, color, size = 13 }: { rate: number; color: string; size?: number }) {
  const n = Math.max(0, Math.min(5, Math.round(rate)));
  return (
    <span style={{ color, letterSpacing: 2, fontSize: size }}>
      {"★".repeat(n)}<span style={{ opacity: 0.3 }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

function LogoTile({ src, title, accent, anim, size }: { src: string | null; title: string; accent: string; anim: string; size: number }) {
  const [broken, setBroken] = useState(false);
  const animCls = anim && anim !== "none" ? `sf-logo-${anim}` : "";
  const box = { width: size, height: size } as const;
  const ok = !!src && src.startsWith("https://") && !broken;
  if (ok) {
    return (
      <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 ${animCls}`} style={box}>
        <img src={src as string} alt={title} onError={() => setBroken(true)}
          className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  const initials = title.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "C";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl border border-white/10 ${animCls}`}
      style={{ ...box, background: `linear-gradient(145deg, ${accent}22, #000)`, color: accent, fontWeight: 700, fontSize: Math.round(size * 0.32) }}>
      {initials}
    </div>
  );
}

// Иконка платёжки: прячется, если ссылка битая или картинка не загрузилась (частый случай у Simple Icons).
function PaymentIcon({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src.startsWith("https://")) return null;
  return (
    <img src={src} alt={alt} title={alt} onError={() => setBroken(true)}
      className="h-5 w-auto shrink-0 object-contain opacity-90" />
  );
}

/**
 * Горизонтальный ряд, который сам измеряет переполнение: пока элементы влезают —
 * обычная строка (с выравниванием align), как только не влезают — плавная
 * бегущая строка с паузой при наведении и уважением к prefers-reduced-motion.
 */
function Marquee({ children, align = "left", gap = 12 }: { children: ReactNode; align?: "left" | "center" | "right"; gap?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [dur, setDur] = useState(22);

  useEffect(() => {
    const wrap = wrapRef.current, block = blockRef.current;
    if (!wrap || !block) return;
    const measure = () => {
      const single = block.scrollWidth;
      const overflow = single > wrap.clientWidth + 4;
      setAnimate(overflow);
      setDur(Math.max(12, Math.round(single / 40))); // ~40px/сек
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [children]);

  const justify = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const blockStyle: CSSProperties = { display: "flex", gap, flexShrink: 0, alignItems: "center" };

  return (
    <div ref={wrapRef} className="sf-marquee">
      <div className={animate ? "sf-marquee-track sf-marquee-anim" : "sf-marquee-track"}
        style={{ width: animate ? "max-content" : "100%", justifyContent: animate ? "flex-start" : justify,
                 ["--marq-dur" as any]: `${dur}s` }}>
        <div ref={blockRef} style={blockStyle}>{children}</div>
        {animate && <div aria-hidden style={{ ...blockStyle, paddingLeft: gap }}>{children}</div>}
      </div>
    </div>
  );
}

export function StorefrontHeader({ theme }: { theme: Theme }) {
  return (
    <header className="rounded-2xl border p-7 text-center"
      style={{ borderColor: `${theme.accent_color}33`, background: "radial-gradient(120% 100% at 50% 0%, #15131b, #0a0a0a)" }}>
      {theme.logo_url && <img src={theme.logo_url} alt="" className="mx-auto mb-3 h-10 w-auto object-contain" />}
      <div style={{ fontFamily: ff(theme.font_heading), letterSpacing: 6 }}>
        <div className="text-xs" style={{ color: "#b9b9b9", letterSpacing: 8 }}>{theme.header_title}</div>
        <div className="mt-0.5 text-3xl" style={{ color: theme.accent_color }}>{theme.header_brand}</div>
      </div>
      <div className="mt-2 text-sm italic" style={{ fontFamily: ff(theme.font_heading), color: `${theme.accent_color}cc` }}>
        {theme.tagline}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {theme.pills.map((p, i) => (
          <span key={i} className="rounded-full border px-4 py-1.5 text-sm"
            style={{ borderColor: "#2e2e2e", color: "#e9e9e9", fontFamily: ff(theme.font_body) }}>{p}</span>
        ))}
      </div>
    </header>
  );
}

// Разбираем строку бонуса на части, чтобы собрать аккуратный блок,
// а не вываливать длинный текст одним заголовком.
function parseBonus(text?: string) {
  if (!text) return { percent: null, amount: null, spins: null };
  const percent = text.match(/\d+\s?%/)?.[0]?.replace(/\s+/g, "") ?? null;
  const amount =
    text.match(/[£$€]\s?[\d.,]+/)?.[0]?.replace(/\s+/g, "") ??
    text.match(/\b[\d.,]+\s?(?:CAD|EUR|GBP|USD|NZD|AUD)\b/i)?.[0]?.replace(/\s+/g, " ") ??
    null;
  const spins = text.match(/\d+\s*(?:free\s*)?spins/i)?.[0]?.replace(/\s+/g, " ") ?? null;
  return { percent, amount, spins };
}

// Угол для corner-бейджа + скруглённый внутренний угол.
function badgeCorner(pos: Theme["badge_position"]): CSSProperties {
  switch (pos) {
    case "tl": return { top: 0, left: 0, borderBottomRightRadius: 14 };
    case "bl": return { bottom: 0, left: 0, borderTopRightRadius: 14 };
    case "br": return { bottom: 0, right: 0, borderTopLeftRadius: 14 };
    case "tr":
    default:   return { top: 0, right: 0, borderBottomLeftRadius: 14 };
  }
}

function RatingDisplay({ rate, theme, headFont }: { rate: number; theme: Theme; headFont: string }) {
  const accent = theme.accent_color;
  const size = theme.rating_size;
  switch (theme.rating_style) {
    case "badge":
      return (
        <div className="sf-rate shrink-0 flex items-center justify-center rounded-full font-bold"
          style={{ width: size * 2, height: size * 2, background: accent, color: "#111", fontFamily: headFont, fontSize: Math.round(size * 0.7) }}>
          {rate}
        </div>
      );
    case "stars":
      return (
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <Stars rate={rate} color={accent} size={Math.round(size * 0.6)} />
          <span className="text-xs text-neutral-400">{rate}/5</span>
        </div>
      );
    case "minimal":
      return (
        <div className="shrink-0 leading-none" style={{ color: accent, fontFamily: headFont, fontSize: size }}>
          {rate}<span className="align-top text-sm text-neutral-400">/5</span>
        </div>
      );
    case "bar":
      return (
        <div className="shrink-0" style={{ width: 120 }}>
          <div className="flex items-baseline justify-between">
            <span style={{ color: accent, fontFamily: headFont, fontSize: Math.round(size * 0.75) }}>{rate}</span>
            <span className="text-xs text-neutral-400">/5</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: "#333" }}>
            <div className="h-full rounded-full" style={{ width: `${(rate / 5) * 100}%`, background: accent }} />
          </div>
        </div>
      );
    case "box":
    default:
      return (
        <div className="sf-rate shrink-0 rounded-2xl border px-4 py-2 text-center"
          style={{ borderColor: accent, background: "linear-gradient(180deg, #221a06, #000)", boxShadow: `0 0 18px ${accent}22` }}>
          <div className="leading-none" style={{ color: accent, fontFamily: headFont, fontSize: size }}>
            {rate}<span className="align-top text-sm text-neutral-400">/5</span>
          </div>
          <div className="mt-1"><Stars rate={rate} color={accent} /></div>
        </div>
      );
  }
}

export function StorefrontCard({ casino, idx, theme }: { casino: Casino; idx: number; theme: Theme }) {
  const badge = theme.badges[idx];
  const primary = idx === 0;
  const btnColor = primary ? theme.button_primary : theme.button_secondary;
  const btnText = primary ? theme.button_fg : theme.button_fg2;
  const safeLink = casino.link?.startsWith("https://") ? casino.link : undefined;
  const headline = casino.bonuses[0]?.bonus;
  const { percent, amount, spins } = parseBonus(headline);
  const extra = casino.bonuses.slice(1).map((b) => b.bonus).join(" · ");
  const compact = theme.card_variant === "compact";
  const pillRadius = theme.pill_shape === "square" ? 8 : 999;
  const grad = `linear-gradient(100deg, ${theme.card_from}, ${theme.card_to})`;
  const headFont = ff(theme.font_heading);
  const bodyFont = ff(theme.font_body);

  const ratingLeft = theme.rating_position === "left";
  const bonusCenter = theme.bonus_align === "center";
  const btnSize =
    theme.button_size === "sm" ? "px-6 py-2.5 text-base"
    : theme.button_size === "lg" ? "px-10 py-5 text-xl"
    : "px-8 py-4 text-lg";
  const btnAnim = theme.button_anim !== "none" ? `sf-btn-${theme.button_anim}` : "";
  const icoAnim = theme.button_icon_anim !== "none" ? `sf-ico-${theme.button_icon_anim}` : "";
  const icoSize = theme.button_icon_size;
  const buttonIcon = theme.button_icon
    ? theme.button_icon.startsWith("http")
      ? <img src={theme.button_icon} alt="" className={icoAnim} style={{ height: icoSize, width: "auto", objectFit: "contain", flex: "none" }} />
      : PLAY_ICON_MAP[theme.button_icon]
        ? <svg viewBox="0 0 24 24" width={icoSize} height={icoSize} fill="currentColor" aria-hidden
            className={icoAnim} style={{ flex: "none" }}
            dangerouslySetInnerHTML={{ __html: PLAY_ICON_MAP[theme.button_icon] }} />
        : null
    : null;

  const paymentIcons = casino.payments
    .filter((p) => !!p.payment_link)
    .map((p) => <PaymentIcon key={p.id} src={p.payment_link as string} alt={p.payment} />);

  return (
    <article className={`sf-card relative overflow-hidden border ${primary ? "sf-top" : ""}`}
      style={{
        borderColor: `${theme.accent_color}44`, background: "#0b0b0b",
        borderRadius: theme.card_radius, fontFamily: bodyFont,
        boxShadow: `0 1px 0 ${theme.accent_color}1a inset, 0 10px 30px rgba(0,0,0,.4)`,
        ["--card-accent" as any]: theme.accent_color,
      }}>
      {badge && theme.badge_style === "corner" && (
        <span className="absolute z-10 px-4 py-1.5 text-sm font-medium"
          style={{ ...badgeCorner(theme.badge_position), background: theme.accent_color, color: "#111" }}>{badge}</span>
      )}

      {/* header */}
      <div className="flex items-center justify-between gap-3 p-5"
        style={{ flexDirection: ratingLeft ? "row-reverse" : "row" }}>
        <div className="flex items-center gap-3" style={{ flexDirection: theme.logo_order === "after" ? "row-reverse" : "row" }}>
          {theme.show_logo && <LogoTile src={casino.logo_img} title={casino.title} accent={theme.accent_color} anim={theme.logo_anim} size={theme.logo_size} />}
          {theme.show_title && (
            <div className="text-lg font-semibold text-white" style={{ fontFamily: headFont, letterSpacing: 0.5 }}>
              {casino.title}
            </div>
          )}
        </div>
        {theme.show_rating && <RatingDisplay rate={casino.casino_rate} theme={theme} headFont={headFont} />}
      </div>

      {badge && theme.badge_style === "bar" && (
        <div className="px-5 py-2 text-sm font-medium"
          style={{ background: `linear-gradient(90deg, ${theme.accent_color}22, transparent)`, color: theme.accent_color }}>
          ⚡ {badge}
        </div>
      )}

      {/* welcome bonus */}
      {!compact && headline && (
        <div className="px-5 pt-5" style={{ background: grad, textAlign: theme.bonus_align }}>
          <div className="text-[11px] font-medium tracking-[0.2em] text-white/70">WELCOME BONUS</div>

          {percent ? (
            <div className={`mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${bonusCenter ? "justify-center" : ""}`}>
              <span className="leading-none text-white"
                style={{ fontFamily: headFont, fontSize: theme.heading_size }}>{percent}</span>
              {amount && (
                <span className="text-lg text-white/90" style={{ fontFamily: headFont }}>
                  up to {amount}
                </span>
              )}
            </div>
          ) : (
            <div className="mt-1.5 line-clamp-2 text-xl leading-snug text-white"
              style={{ fontFamily: headFont }}>{headline}</div>
          )}

          {spins && (
            <span className="mt-2 inline-block rounded-full px-3 py-1 text-sm text-white"
              style={{ background: "rgba(255,255,255,.1)" }}>+ {spins}</span>
          )}
          {extra && <div className="mt-2 text-sm text-white/65">{extra}</div>}
        </div>
      )}

      {/* features — single row, auto-scrolls when it overflows */}
      {casino.features.length > 0 && (
        <div className="px-5 py-4" style={compact ? undefined : { background: grad }}>
          <Marquee align={bonusCenter ? "center" : "left"} gap={8}>
            {casino.features.map((f) => (
              <span key={f.id} className="whitespace-nowrap border px-3 py-1.5 text-sm text-white"
                style={{ borderColor: "#ffffff2e", borderRadius: pillRadius, background: "rgba(255,255,255,.04)" }}>
                ⚡ {f.feature}
              </span>
            ))}
          </Marquee>
        </div>
      )}

      {/* payments — single row, auto-scrolls when it overflows */}
      {theme.show_payments && paymentIcons.length > 0 && (
        <div className="px-5 py-3">
          <Marquee align={theme.payments_align} gap={14}>{paymentIcons}</Marquee>
        </div>
      )}

      {/* CTA */}
      <div className="p-5 pt-1" style={{ textAlign: theme.button_align }}>
        {safeLink ? (
          <a href={safeLink} target="_blank" rel="noopener noreferrer sponsored"
            className={`sf-cta ${primary ? "sf-cta--top" : ""} ${btnAnim} ${theme.button_full ? "block w-full" : "inline-block"} rounded-full text-center font-semibold transition hover:brightness-110 ${btnSize}`}
            style={{ background: `linear-gradient(180deg, ${btnColor}, ${btnColor}cc)`, color: btnText, fontFamily: headFont, letterSpacing: 1 }}>
            <span className="inline-flex items-center justify-center gap-2 align-middle">
              {buttonIcon && theme.button_icon_pos === "left" && buttonIcon}
              <span>{theme.button_text} ›</span>
              {buttonIcon && theme.button_icon_pos === "right" && buttonIcon}
            </span>
          </a>
        ) : (
          <span className={`${theme.button_full ? "block w-full" : "inline-block"} rounded-full bg-neutral-800 ${btnSize} text-center text-neutral-400`}>Unavailable</span>
        )}
      </div>
    </article>
  );
}
