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
- Framework preset: **Next.js**
- Build command: `npx @cloudflare/next-on-pages`
- Build output dir: `.vercel/output/static`
- Env var: `NEXT_PUBLIC_API_URL` = https-адрес API на Render
- Node 20+
# table-new-web
