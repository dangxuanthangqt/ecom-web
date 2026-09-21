# 1. Chạy dự án

## Cần gì trước

| Thứ | Ghi chú |
|---|---|
| Node 20+ và `pnpm` | `package.json` dùng pnpm workspace |
| Backend `../ecom` đang chạy | Không có backend thì FE render được layout nhưng mọi danh sách đều rỗng |
| Postgres + Redis cho backend | `cd ../ecom && docker compose up -d` — Postgres ở cổng **5433**, không phải 5432 |

## Bốn lệnh

```bash
cd ~/Desktop/ecom && docker compose up -d && pnpm start:dev   # API cổng 4000
cd ~/Desktop/ecom-web
pnpm install
cp .env.example .env.local
pnpm dev                                                       # http://localhost:3000
```

Mở `http://localhost:3000` → Next đẩy sang `http://localhost:3000/vi`.

## Biến môi trường

`.env.local` chỉ có hai biến:

```bash
API_URL=http://localhost:4000          # server-only, browser không bao giờ thấy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`API_URL` **không có tiền tố `NEXT_PUBLIC_`** là cố ý: browser không gọi thẳng
Nest, nó gọi `/api/proxy/*` cùng origin. Xem [02-architecture.md](02-architecture.md#token-sống-ở-đâu).

`NEXT_PUBLIC_APP_URL` phải khớp `GOOGLE_REDIRECT_CLIENT_URI` bên Nest, nếu không
luồng đăng nhập Google sẽ quay về sai chỗ.

## Script

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Dev server (turbopack) |
| `pnpm build` | Build production |
| `pnpm start` | Chạy bản đã build |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Typecheck — chạy trước khi commit |

## Tài khoản để đăng nhập

Dự án **không có tài khoản mẫu hard-code**. Có ba đường:

1. **Seed từ backend** — `cd ../ecom && pnpm db:seed`, tạo tài khoản admin theo
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env` của backend. Mật khẩu phải ≥ 8 ký tự.
2. **Tự đăng ký** ở `/vi/register` — bước này cần mã OTP gửi qua email, nên
   `RESEND_API_KEY` bên backend phải là key thật. Tài khoản tự đăng ký chỉ có
   quyền khách hàng, không vào được `/admin`.
3. **Google** — bấm "Google" ở màn đăng nhập, cần `GOOGLE_CLIENT_ID/SECRET` bên backend.

> Ghi chú đã biết: trên máy dev hiện tại DB `ecom_prod` rỗng và `RESEND_API_KEY`
> trống, nên chưa chạy được một phiên đăng nhập thật đầu-cuối. Nếu bạn gặp
> "không nhận được OTP", kiểm tra key này trước khi nghi ngờ FE.

## Sinh lại type khi API đổi

`src/lib/api/schema.ts` được sinh tự động từ swagger của backend. **Đừng sửa tay.**

```bash
cd ../ecom && pnpm build:swagger
cd ../ecom-web
pnpm exec openapi-typescript ../ecom/swagger.yaml --export-type -o src/lib/api/schema.ts
```

`src/lib/api/types.ts` là lớp alias mỏng đặt tên dễ đọc cho các schema đó
(`Product`, `OrderDetail`, `Profile`…). Cần thêm alias thì sửa file này.

## Lỗi hay gặp

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Trang chủ không có sản phẩm nào | Backend chưa chạy, hoặc DB chưa seed. Trang chủ nuốt lỗi (`.catch(() => null)`) nên không báo đỏ |
| Vào `/vi/cart` bị đá về `/vi/login?next=/vi/cart` | Không có cookie `ecom_rt` — chưa đăng nhập hoặc phiên đã hết hạn (7 ngày) |
| Bộ lọc **Danh mục** ở `/products` không hiện | Đúng thiết kế: `GET /categories` cần đăng nhập, nên filter chỉ xuất hiện khi đã có phiên |
| Vào `/vi/admin` thấy "không có quyền" | Đăng nhập được nhưng role không có quyền quản trị nào. Xem [04-screens-admin.md](04-screens-admin.md#bảng-quyền) |
| Ảnh sản phẩm hiện icon xám | URL ảnh trong DB seed không còn tồn tại; `RemoteImage` hạ cấp thành placeholder thay vì vỡ ảnh |
| Gọi `/api/proxy/auth/login` trả 404 `NOT_PROXYABLE` | Cố ý chặn. Dùng `/api/auth/login` |
| 401 lặp lại rồi bị đăng xuất | Refresh token hết hạn → proxy xóa cookie. Đăng nhập lại |

## Thư mục

```
src/
├── app/[locale]/(storefront)/   trang chủ, sản phẩm, giỏ, checkout, đơn, tài khoản
├── app/[locale]/(auth)/         login, register, forgot-password, oauth/google
├── app/[locale]/admin/          11 trang quản trị
├── app/api/auth|proxy/          route handler giữ cookie + proxy tự refresh
├── components/ui/               shadcn (Base UI) — hạ tầng, ít khi sửa
├── components/common/           mảnh dùng chung: Field, PaginationBar, RemoteImage…
├── components/storefront/       màn người mua
├── components/admin/            màn quản trị
├── components/auth/             form đăng nhập/đăng ký/OTP/Google
├── lib/api/                     client, server, hooks, types, schema sinh tự động
├── lib/auth/                    cookie + bản đồ quyền
└── i18n/                        routing, navigation, request
messages/{vi,en}.json            toàn bộ chuỗi hiển thị
design-system/ecom-web/          MASTER.md — nguồn của token màu/chữ
e2e/                             khung Playwright + mock API (thư mục tests hiện rỗng)
```
