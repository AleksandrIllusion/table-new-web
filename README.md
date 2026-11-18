# web — Next.js (admin + public listing)

## Dev
```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL -> адрес API
npm install
npm run dev                  # http://localhost:3000
```

## Routes
- `/`                      — выбор страны
- `/[country]`            — публичный листинг казино (адаптив), напр. /FI
- `/admin/casinos/new`    — форма создания казино (zod-валидация)

## Deploy → Cloudflare Pages

This app uses **`@cloudflare/next-on-pages`** (SSR / Edge), not a static `output: 'export'`.
Plain `next build` writes `.next` only — it does **not** create an `out/` folder.
The Pages adapter emits the deployable assets under `.vercel/output/static`
(see `wrangler.toml` → `pages_build_output_dir`).

### Dashboard settings (required)

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (or None) |
| Build command | `npx @cloudflare/next-on-pages` (or `npm run pages:build`) |
| Build output directory | `.vercel/output/static` |
| Compatibility flags | `nodejs_compat` |
| Node.js version | 20+ |
| Env var | `NEXT_PUBLIC_API_URL` = HTTPS API URL (e.g. Render) |

**Do not** set output directory to `out` and **do not** use `npx next build` as the only
build command — that combination fails with `Output directory "out" not found`.

Local check (same artifact Cloudflare deploys):

```bash
npm install
npm run pages:build
# expect: .vercel/output/static/
```

# table-new-web
