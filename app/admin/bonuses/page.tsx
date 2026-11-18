"use client";
import { ResourceAdmin } from "@/components/resource-admin";
export default function Page() {
  return <ResourceAdmin title="Bonuses" listPath="/bonuses" createPath="/bonuses/create"
    fields={[{ name: "bonus", label: "Bonus", required: true }]}
    columns={[{ header: "Bonus", cell: (r) => r.bonus }]} />;
}
