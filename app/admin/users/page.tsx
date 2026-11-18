"use client";
import { ResourceAdmin } from "@/components/resource-admin";
export default function Page() {
  return <ResourceAdmin title="Users" listPath="/users" createPath="/users/create"
    fields={[
      { name: "user_name", label: "Username (min 3)", required: true, pattern: /^.{3,}$/, patternMsg: "Min 3 chars" },
      { name: "email", label: "Email", type: "email", required: true, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, patternMsg: "Invalid email" },
      { name: "password", label: "Password", type: "password", required: true,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/, patternMsg: "Min 6: lower, upper, digit, special" },
    ]}
    columns={[
      { header: "Username", cell: (r) => r.user_name },
      { header: "Email", cell: (r) => r.email },
    ]} />;
}
