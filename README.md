# ecom-web

Frontend cho API NestJS ở `../ecom` — storefront + trang quản trị, song ngữ VI/EN,
phủ toàn bộ 50 endpoint của backend.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Base UI) ·
TanStack Query v5 · next-intl · openapi-typescript

## Chạy

```bash
pnpm install
cp .env.example .env.local   # API_URL trỏ tới Nest, mặc định http://localhost:4000
pnpm dev                     # http://localhost:3000 -> /vi
```

Backend phải chạy trước (`cd ../ecom && pnpm start:dev`), kèm Postgres 5433 + Redis
qua `docker compose up -d`.

## Token sống ở đâu

Access token và refresh token **không bao giờ chạm vào JavaScript phía client**:

```
browser → /api/auth/login   → Nest /auth/login → set 2 httpOnly cookie
browser → /api/proxy/<path> → gắn Bearer từ cookie → Nest
                             ↳ 401 thì tự refresh 1 lần rồi replay
server component            → gọi thẳng Nest, đọc cookie qua cookies()
```

`/api/proxy` chặn `auth/login`, `auth/logout`, `auth/refresh-token` — proxy chúng
đồng nghĩa với việc trả token thô về browser.

## Sinh lại type khi API đổi

```bash
cd ../ecom && pnpm build:swagger
cd ../ecom-web && pnpm exec openapi-typescript ../ecom/swagger.yaml --export-type -o src/lib/api/schema.ts
```

`src/lib/api/types.ts` là lớp alias mỏng trên file sinh tự động — sửa ở đó, không sửa `schema.ts`.

## Cấu trúc

```
src/
├── app/[locale]/(storefront)/   trang chủ, sản phẩm, giỏ, checkout, đơn, tài khoản
├── app/[locale]/(auth)/         login, register, forgot-password, oauth/google
├── app/[locale]/admin/          11 trang quản trị
├── app/api/auth|proxy/          route handler giữ cookie + proxy có refresh
├── components/                  ui (shadcn) · common · storefront · admin · auth
├── lib/api/                     client · server · hooks · types · schema sinh tự động
└── i18n/                        routing, navigation, request
messages/{vi,en}.json            324 key, đã kiểm tra khớp khoá 2 chiều
design-system/ecom-web/          MASTER.md do ui-ux-pro-max sinh (nguồn cho token màu/chữ)
```

## i18n

Locale URL là `vi` / `en`; backend dùng `en` / `vn` nên request đính header
`x-lang` đã map qua `apiLanguageByLocale`. Nội dung có bảng `*Translations` được
chọn theo locale, thiếu thì rơi về `en` rồi về tên gốc.

## Design system

Token màu/typography lấy từ `design-system/ecom-web/MASTER.md` (ui-ux-pro-max v2.13,
style *Vibrant & Block-based*). Một sai lệch có chủ đích: MASTER pair Rubik + Nunito Sans,
nhưng Rubik không có subset `vietnamese` → heading dùng **Be Vietnam Pro**.
