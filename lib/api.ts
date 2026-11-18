// Единая точка обращения к API. Адрес берётся из env на этапе сборки —
// никаких localhost/хардкода.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9001";

type Options = RequestInit & { token?: string };

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const { token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
