import Image from "next/image";
import type { Casino } from "@/lib/types";

function Stars({ rate }: { rate: number }) {
  const n = Math.max(0, Math.min(5, Math.round(rate)));
  return <span aria-label={`${rate} out of 5`}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export function CasinoCard({ casino, badge }: { casino: Casino; badge?: string }) {
  const safeLink =
    casino.link?.startsWith("https://") ? casino.link : undefined;

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:flex-row sm:items-center">
      {badge && (
        <span className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-bold text-black">
          {badge}
        </span>
      )}

      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-40">
        <span className="text-4xl font-bold">{casino.casino_rate}</span>
        <span className="text-amber-400"><Stars rate={casino.casino_rate} /></span>
        {casino.logo_img?.startsWith("https://") && (
          <Image
            src={casino.logo_img}
            alt={casino.title}
            width={120}
            height={48}
            className="mt-1 h-12 w-auto object-contain"
          />
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-semibold">{casino.title}</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {casino.features.map((f) => (
            <li key={f.id} className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
              {f.feature}
            </li>
          ))}
        </ul>
        {casino.bonuses.length > 0 && (
          <p className="mt-2 text-sm text-neutral-400">
            {casino.bonuses.map((b) => b.bonus).join(" · ")}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-44">
        {safeLink ? (
          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="rounded-xl bg-green-600 px-4 py-3 text-center font-semibold hover:bg-green-500"
          >
            Play Now
          </a>
        ) : (
          <span className="rounded-xl bg-neutral-700 px-4 py-3 text-center text-neutral-400">
            Unavailable
          </span>
        )}
        <div className="flex flex-wrap justify-center gap-1">
          {casino.payments
            .filter((p) => p.payment_link?.startsWith("https://"))
            .map((p) => (
              <Image
                key={p.id}
                src={p.payment_link as string}
                alt={p.payment}
                width={32}
                height={20}
                className="h-5 w-auto object-contain opacity-80"
              />
            ))}
        </div>
      </div>
    </article>
  );
}
