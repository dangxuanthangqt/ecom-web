# ecom-web

Frontend cho API NestJS ở `../ecom` — storefront + trang quản trị, song ngữ VI/EN,
phủ toàn bộ 50 endpoint của backend.

## Tài liệu

Bộ tài liệu đầy đủ cho người mới nằm ở [`docs/`](docs/README.md): cách chạy,
kiến trúc, mô tả từng màn hình (storefront + admin), sơ đồ luồng, và hướng dẫn
sử dụng từng bước.

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

## Test E2E

```bash
pnpm test:e2e            # 141 test, Playwright tự bật mock API + app đã build
pnpm test:e2e:ui         # chế độ UI để soi từng bước
pnpm test:e2e:report     # mở report HTML sau khi chạy
```

Mặc định suite chạy trên **mock API** (`e2e/mock-api/`) chứ không phải Nest thật:
máy dev không phục vụ được một phiên đăng nhập (DB chưa seed, `RESEND_API_KEY`
trống, `ADMIN_PASSWORD` ngắn hơn ràng buộc của login DTO), và test cần một thế
giới reset được trước mỗi case. Mock bám sát `swagger.yaml`: cùng envelope list
`{pagination, data}`, cùng envelope lỗi `{statusCode, error, message, details}`,
cùng bearer + refresh, cùng ma trận quyền.

Trỏ sang API thật:

```bash
E2E_API_URL=http://localhost:4000 E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
```

Khi đó cần seed sẵn các tài khoản trong `e2e/support/accounts.ts`; nhóm test phụ
thuộc đăng nhập sẽ đỏ nếu thiếu.

| File | Phủ |
|---|---|
| `smoke.spec.ts` | routing, redirect locale, `lang`, chuyển ngôn ngữ giữ nguyên trang |
| `storefront-products.spec.ts` | list, search, lọc brand/giá, sort, empty, chi tiết, gallery, i18n nội dung |
| `reviews.spec.ts` | đọc/viết/sửa/xoá, quyền sở hữu |
| `cart-checkout.spec.ts` | thêm/sửa/xoá, chọn dòng, đặt hàng, trần tồn kho |
| `orders.spec.ts` | danh sách, lọc, chi tiết, huỷ + xác nhận |
| `account.spec.ts` | hồ sơ, đổi mật khẩu, bật/tắt 2FA |
| `auth.spec.ts` | login (2FA), register + OTP, quên mật khẩu, logout, Google |
| `admin-access.spec.ts` | chặn theo quyền, sidebar theo role, dashboard |
| `admin-catalog.spec.ts` | brands, categories, languages CRUD |
| `admin-products.spec.ts` | product CRUD, sinh SKU từ phân loại, cache busting |
| `admin-people.spec.ts` | users, roles, permissions |
| `admin-operations.spec.ts` | đổi trạng thái đơn, bản dịch, media |
| `security.spec.ts` | cookie httpOnly, chặn proxy token endpoint, refresh-on-401 |
| `a11y.spec.ts` | axe WCAG 2.1 AA trên 12 trang, focus, reduced motion |
| `responsive.spec.ts` | 375px: không tràn ngang, drawer, target size |

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
