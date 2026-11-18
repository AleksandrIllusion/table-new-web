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

Static export (`output: "export"` in `next.config.mjs`). `next build` writes the site to **`out/`**.

### Dashboard settings (required)

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (or None) |
| Build command | `npx next build` (or `npm run build`) |
| Build output directory | `out` |
| Node.js version | 20+ |
| Env var | `NEXT_PUBLIC_API_URL` = HTTPS API URL (e.g. Render) |

Local check:

```bash
npm install
npm run build
# expect: out/  (e.g. out/FI.html, out/index.html)
```

### Limitations (static export)
- Country pages are pre-rendered at **build time** for codes in `lib/countries.ts` (`FI`, `NZ`, `CA`, `PT`, `AU`). Add a code there (and redeploy) to publish a new country URL.
- Listing/theme data is snapshotted when Cloudflare builds; it does not SSR on each request.
- Admin UI is client-side JS against the API; it still needs a reachable `NEXT_PUBLIC_API_URL`.
- `next start` is not used for production — Pages serves `out/` as static assets.

# table-new-web
