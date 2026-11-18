import { api } from "@/lib/api";
import type { Casino, Theme } from "@/lib/types";
import { StorefrontHeader, StorefrontCard } from "@/components/storefront";

// Required for Cloudflare Pages (@cloudflare/next-on-pages) SSR on dynamic routes.
export const runtime = "edge";

const FALLBACK: Theme = {
  header_title: "CASINO", header_brand: "CANADA", tagline: "Play Big. Win Bigger.",
  pills: ["24/7 Support", "High withdrawal limit", "VIP"],
  badges: ["Top choice", "Exclusive", "Best values", "Best withdrawal"],
  logo_url: null, accent_color: "#FFD700", bg_color: "#111111",
  card_from: "#3E0037", card_to: "#0D1341",
  button_text: "PLAY NOW", button_primary: "#16A34A", button_secondary: "#FFD700",
  card_variant: "classic", card_radius: 18, badge_style: "bar", pill_shape: "pill",
  show_logo: true, show_payments: true,
};

export default async function CountryPage({ params }: { params: { country: string } }) {
  const code = params.country.toUpperCase();

  let casinos: Casino[] = [];
  let theme: Theme = FALLBACK;
  let error: string | null = null;
  try {
    const [res, t] = await Promise.all([
      api<{ data: Casino[] }>(`/casinos/website/country_code/${encodeURIComponent(code)}?limit=50&sort=DESC`),
      api<Theme>("/theme").catch(() => FALLBACK),
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
