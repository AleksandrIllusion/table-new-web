"use client";
import { ResourceAdmin } from "@/components/resource-admin";
export default function Page() {
  return <ResourceAdmin title="Features" listPath="/features" createPath="/features/create"
    fields={[{ name: "feature", label: "Feature", required: true }]}
    columns={[{ header: "Feature", cell: (r) => r.feature }]} />;
}
