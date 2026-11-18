import Link from "next/link";

const links = [
  { href: "/admin/casinos", label: "Casinos", desc: "Table with create/edit in a popup" },
  { href: "/admin/countries", label: "Countries", desc: "Reference list" },
  { href: "/admin/country-codes", label: "Country codes", desc: "Codes per country" },
  { href: "/admin/bonuses", label: "Bonuses", desc: "Reference list" },
  { href: "/admin/features", label: "Features", desc: "Reference list" },
  { href: "/admin/payments", label: "Payments", desc: "Payment methods" },
  { href: "/admin/users", label: "Users", desc: "Admin accounts" },
];

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600">
            <div className="font-semibold">{l.label}</div>
            <div className="text-sm text-neutral-400">{l.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
