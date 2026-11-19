import { api } from "@/lib/api";
import { STATIC_COUNTRY_CODES } from "@/lib/countries";
import type { Casino, Theme } from "@/lib/types";
import { StorefrontHeader, StorefrontCard } from "@/components/storefront";

const FALLBACK: Theme = {
  header_title: "CASINO", header_brand: "UNITED KINGDOM", tagline: "Play Big. Win Bigger.",
  pills: ["24/7 Support", "Fast Withdrawals", "VIP"],
  badges: ["Top choice", "Exclusive", "Best values", "Best withdrawal"],
  logo_url: null, accent_color: "#FFD700", bg_color: "#111111",
  card_from: "#3E0037", card_to: "#0D1341",
  button_text: "PLAY NOW", button_primary: "#16A34A", button_secondary: "#FFD700",
  card_variant: "classic", card_radius: 18, badge_style: "bar", pill_shape: "pill",
  show_logo: true, show_payments: true,
  font_heading: "Aboreto", font_body: "Inter", heading_size: 38,
  badge_position: "tr", rating_position: "right",
  button_size: "md", button_align: "center", button_full: true,
  payments_align: "left", bonus_align: "left",
};

/** Required for `output: 'export'` — only these codes are written into `out/`. */
export function generateStaticParams() {
  return STATIC_COUNTRY_CODES.map((country) => ({ country }));
}

export default async function CountryPage({ params }: { params: { country: string } }) {
  const code = params.country.toUpperCase();

  let casinos: Casino[] = [];
  let theme: Theme = FALLBACK;
  let error: string | null = null;
  try {
    const [res, t] = await Promise.all([
      api<{ data: Casino[] }>(
        `/casinos/website/country_code/${encodeURIComponent(code)}?limit=50&sort=DESC`,
        { cache: "force-cache" },
      ),
      api<Theme>("/theme", { cache: "force-cache" }).catch(() => FALLBACK),
    ]);
    casinos = res.data ?? [];
    if (t) theme = { ...FALLBACK, ...t };
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8" style={{ background: theme.bg_color }}>
      <div className="flex flex-col gap-6">
        <StorefrontHeader theme={theme} />
        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950 p-4 text-red-200">{error}</p>
        )}
        {!error && casinos.length === 0 && (
          <p className="text-center text-neutral-400">No casinos available for {code}.</p>
        )}
        {casinos.map((c, i) => (
          <StorefrontCard key={c.casino_id} casino={c} idx={i} theme={theme} />
        ))}
      </div>
    </main>
  );
}
