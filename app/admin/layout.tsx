"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

const NAV = [
  { href: "/admin/casinos", label: "Casinos" },
  { href: "/admin/storefront", label: "Storefront" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/country-codes", label: "Codes" },
  { href: "/admin/bonuses", label: "Bonuses" },
  { href: "/admin/features", label: "Features" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/admin" className="mr-2 font-semibold">Admin</Link>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    active ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-900"
                  }`}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => { clearToken(); router.push("/login"); }}
            className="ml-auto rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
