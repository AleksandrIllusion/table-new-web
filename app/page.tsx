import Link from "next/link";
import { STATIC_COUNTRY_CODES } from "@/lib/countries";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Casino Platform</h1>
      <p className="mt-3 text-neutral-400">
        Public listing per country, e.g. <code className="text-neutral-200">/FI</code>.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {STATIC_COUNTRY_CODES.map((c) => (
          <Link
            key={c}
            href={`/${c}`}
            className="rounded-lg border border-neutral-700 px-4 py-2 hover:bg-neutral-800"
          >
            {c}
          </Link>
        ))}
        <Link
          href="/admin/casinos/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
        >
          Admin: add casino
        </Link>
      </div>
    </main>
  );
}
