"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { cx, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const { token } = await api<{ token: string }>("/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      setToken(token);
      router.push("/admin/casinos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      {error && <p className={`mb-4 ${cx.errorBox}`}>{error}</p>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cx.input} />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={cx.input} />
        </Field>
        <button type="submit" disabled={loading} className={cx.btnPrimary}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
