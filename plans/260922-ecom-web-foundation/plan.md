# ecom-web — FE phủ toàn bộ API của ecom (NestJS)

Status: done · Started 2026-09-22 · Stack: Next.js 15 (App Router) + TS + Tailwind v4 + shadcn/ui

## Mục tiêu
Một app Next.js phủ **50 endpoint** của backend `~/Desktop/ecom`: storefront (mua hàng) + admin (quản trị), song ngữ EN/VI.

## Quyết định nền
| Hạng mục | Chốt | Lý do |
|---|---|---|
| Kiểu token | JWT access + refresh, lưu **httpOnly cookie** do Next set | Không để refresh token trong localStorage (XSS là mất sạch) |
| Gọi API từ browser | Qua proxy `/api/proxy/[...path]` của Next | Cookie httpOnly → server đính Bearer, tự refresh khi 401 |
| Gọi API từ server component | Thẳng tới `API_URL`, đọc token từ `cookies()` | Bỏ được một hop |
| Types | `openapi-typescript` sinh từ `swagger.yaml` → `src/lib/api/schema.ts` | Không viết tay type, không lệch contract |
| i18n | `next-intl`, locale `en`/`vi`, gửi header `x-lang` (`vi`→`vn`) | Backend resolve qua `x-lang` / `Accept-Language`, thư mục i18n là `en`/`vn` |
| Data layer | TanStack Query v5 | Cache, invalidate, optimistic cho cart |
| Form | react-hook-form + zod | Map được `details[]` của lỗi backend vào từng field |

## Contract backend đã xác minh
- List envelope: `{ pagination: { totalPages, totalItems, pageSize, pageIndex }, data: [] }`
- Error envelope: `{ statusCode, error, message, details: [{field, ...}], requestId? }`
- Auth: register/forgot-password cần OTP `code` (gọi `POST /auth/otp` trước); login có thể cần `totpCode` hoặc `code` khi bật 2FA
- Upload: `POST /media/upload/image` field `image`; `POST /media/upload/array-of-images` field `files`
- CORS backend đã mở sẵn cho `http://localhost:3000`; API chạy cổng 4000

## Phase
| # | Phase | Nội dung | Status |
|---|---|---|---|
| 01 | Foundation | scaffold, design tokens, i18n, proxy, api client, auth cookie | done |
| 02 | Auth | register + OTP, login (2FA), forgot-password, logout, Google OAuth, 2FA enable/disable | done |
| 03 | Storefront | home, product list/filter, product detail, review, cart, checkout, orders, profile | done |
| 04 | Admin | dashboard, products, brands, categories, translations, languages, users, roles, permissions, orders, media | done |
| 05 | Verify | typecheck + lint + build | done |

## Design system
`design-system/ecom-web/MASTER.md` (ui-ux-pro-max v2.13): Feature-Rich Showcase · Vibrant & Block-based ·
primary `#059669`, accent `#EA580C` · Rubik / Nunito Sans · override cho admin ở `pages/admin-dashboard.md` (density 8).

## Đã kiểm chứng (2026-09-22)
- `pnpm exec tsc --noEmit` sạch · `pnpm lint` sạch · `pnpm build` xanh (tất cả route)
- Chạy thật với Nest ở cổng 4000: `/vi`, `/en`, `/vi/products`, `/en/products`, `/vi/login`, `/vi/register` trả 200
- `/` → 307 `/vi`; `/vi/admin` chưa đăng nhập → 307 `/vi/login?next=/vi/admin`
- `/api/proxy/products` 200 · `/api/proxy/profile` 401 đúng envelope · `/api/proxy/auth/login` 404 NOT_PROXYABLE
- `/api/auth/login` chuyển tiếp tới Nest và trả nguyên `details[]` để map vào field

## Chưa kiểm chứng được
Dev DB `ecom_prod` rỗng (0 user, 0 device) nên chưa chạy được một phiên đăng nhập thật:
cookie httpOnly + refresh-on-401 mới chỉ verify được ở nhánh 401 và nhánh set-cookie.
Cần `pnpm db:seed` phía backend, `ADMIN_PASSWORD` >= 8 ký tự và `RESEND_API_KEY` thật.
