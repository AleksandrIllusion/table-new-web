import Link from "next/link";

const links = [
  { href: "/admin/casinos", label: "Casinos", desc: "Table, create/edit popup, rating order" },
  { href: "/admin/storefront", label: "Storefront design", desc: "Colors, fonts, layout — live preview" },
  { href: "/admin/countries", label: "Countries", desc: "Reference list" },
  { href: "/admin/country-codes", label: "Country codes", desc: "Codes per country" },
  { href: "/admin/bonuses", label: "Bonuses", desc: "Reference list" },
  { href: "/admin/features", label: "Features", desc: "Reference list" },
  { href: "/admin/payments", label: "Payments", desc: "Payment methods + logos" },
  { href: "/admin/users", label: "Users", desc: "Admin accounts" },
];

export default function AdminHome() {
  return (
    <main className="px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-white">Admin</h1>
      <p className="mb-6 text-sm text-neutral-400">Manage the casino catalog and storefront.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="font-medium text-white">{l.label}</div>
              <span className="text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-neutral-300">→</span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">{l.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
