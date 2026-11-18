"use client";
import { ResourceAdmin } from "@/components/resource-admin";
export default function Page() {
  return <ResourceAdmin title="Payments" listPath="/payments" createPath="/payments/create"
    fields={[
      { name: "payment", label: "Payment", required: true },
      { name: "payment_link", label: "Logo URL (https://)", pattern: /^https:\/\/[^\s]+$/, patternMsg: "Must be https:// URL" },
    ]}
    columns={[
      { header: "Payment", cell: (r) => r.payment },
      { header: "Logo", cell: (r) => r.payment_link ?? "—" },
    ]} />;
}
