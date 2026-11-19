"use client";
import { ResourceAdmin } from "@/components/resource-admin";

export default function Page() {
  return (
    <ResourceAdmin
      title="Countries"
      listPath="/countries"
      createPath="/countries/create"
      fields={[{ name: "country", label: "Country", required: true }]}
      columns={[{ header: "Country", cell: (r) => r.country }]}
      updatePath={(r) => `/countries/${r.id}`}
      deletePath={(r) => `/countries/${r.id}`}
    />
  );
}
