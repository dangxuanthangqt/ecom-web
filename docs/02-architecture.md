# 2. Kiến trúc

Bảy mảnh ghép nên app này. Hiểu bảy mảnh là đọc được mọi màn.

```
Browser
  │  fetch cùng origin
  ├─ /api/auth/login|logout|google   → đổi token lấy cookie httpOnly
  └─ /api/proxy/<path>               → đính Bearer, tự refresh khi 401
                                         │
Server Component ──── apiServer() ───────┴────► NestJS  (API_URL, mặc định :4000)
```

## 2.1 Routing và nhóm route

Next App Router, mọi thứ nằm dưới `src/app/[locale]/`.

| Nhóm | Thư mục | Khung bọc |
|---|---|---|
| Storefront | `(storefront)/` | `SiteHeader` + `main` + `SiteFooter` |
| Auth | `(auth)/` | Nền gradient, logo + `LocaleSwitcher`, khung hẹp 448px |
| Admin | `admin/` | `AdminSidebar` bên trái + thanh header phải |

Dấu ngoặc `(storefront)` là **route group**: chỉ để gom layout, không xuất hiện
trong URL. Vì vậy `/vi/cart` chứ không phải `/vi/storefront/cart`.

`src/app/layout.tsx` gần như rỗng — thẻ `<html>`/`<body>` nằm ở
`[locale]/layout.tsx`, vì đó là layout đầu tiên biết ngôn ngữ để khai báo `lang`.

`[locale]/layout.tsx` dựng bốn provider theo thứ tự:
`NextIntlClientProvider` → `QueryProvider` (TanStack Query) → `SessionProvider` →
`Toaster` (sonner). Nó cũng đọc cookie refresh token và truyền `hasSessionCookie`
xuống `SessionProvider`.

## 2.2 Middleware — chặn cửa trước

`src/middleware.ts` làm hai việc, theo thứ tự:

1. **Gác phiên.** Nếu path (đã bỏ locale) bắt đầu bằng `/account`, `/cart`,
   `/checkout`, `/orders`, `/admin` mà **không có cookie `ecom_rt`** → redirect
   sang `/{locale}/login?next=<đường dẫn cũ>`.
2. **next-intl middleware** — thêm/chuẩn hóa prefix locale.

Chỉ kiểm tra **refresh token**, cố tình không kiểm access token: access token hết
hạn sau 1 giờ và proxy tự làm mới; nếu chặn theo nó thì cứ mỗi giờ người dùng lại
bị đá ra đăng nhập vô cớ.

Middleware **không** kiểm quyền admin — việc đó do `AdminGuard` phía client và
API phía server làm.

## 2.3 Token sống ở đâu

Nguyên tắc: **access token và refresh token không bao giờ chạm vào JavaScript của
browser.** XSS đọc `document.cookie` cũng không lấy được gì.

| Cookie | Tên | Hạn | Cờ |
|---|---|---|---|
| Access token | `ecom_at` | 1 giờ | httpOnly, sameSite=lax, secure ở production |
| Refresh token | `ecom_rt` | 7 ngày | như trên |

Ba route handler ghi cookie (`src/app/api/auth/`):

- **`POST /api/auth/login`** — nhận `{email, password, totpCode?}`, gọi
  `POST /auth/login` của Nest, giữ lại cặp token, chỉ trả `{ ok: true }` về
  browser. Nếu Nest lỗi thì trả nguyên body lỗi (kèm `details[]`) để form gắn
  lỗi vào từng ô nhập.
- **`POST /api/auth/logout`** — gọi `POST /auth/logout` để thu hồi thiết bị, rồi
  xóa cookie. Gọi hỏng vẫn xóa cookie: không thể để UI tiếp tục nghĩ là "đang đăng nhập".
- **`POST /api/auth/google`** — nhận cặp token mà Nest nhét vào query string sau
  OAuth, đổi thành cookie.

## 2.4 Proxy `/api/proxy/[...path]`

Một cánh cửa duy nhất giữa browser và Nest (`src/app/api/proxy/[...path]/route.ts`).
Nhận GET/POST/PUT/PATCH/DELETE.

Trình tự mỗi request:

1. Chặn cứng ba route `auth/login`, `auth/logout`, `auth/refresh-token` → trả 404
   `NOT_PROXYABLE`. Proxy chúng đồng nghĩa với việc trả token thô cho browser.
2. Dựng header ra ngoài: copy nguyên `content-type` (giữ boundary của multipart),
   `accept: application/json`, `x-lang` theo cookie `NEXT_LOCALE`, và
   `authorization: Bearer <ecom_at>` nếu có.
3. Gửi đi. Nếu **401** và có `ecom_rt`: gọi `POST /auth/refresh-token` **đúng một
   lần**, rồi phát lại request với access token mới.
4. Refresh thành công → set lại cả hai cookie trên response.
   Refresh thất bại mà vẫn có refresh token → xóa cookie, trả 401 về (phiên chết).
5. Trả nguyên status, content-type và body của Nest — FE đọc được đúng envelope lỗi.

```
browser ──► /api/proxy/orders ──► Nest /orders      401
                   │
                   └─► Nest /auth/refresh-token  ──► cặp token mới
                   └─► Nest /orders (lần 2)      ──► 200  + set-cookie
```

## 2.5 Hai đường gọi API

| Bối cảnh | Hàm | Đường đi |
|---|---|---|
| Client component | `apiClient` (`lib/api/client.ts`) | `/api/proxy/<path>` |
| Server component | `apiServer` (`lib/api/server.ts`) | thẳng tới `API_URL`, đọc cookie bằng `cookies()` |

Server component bỏ được một hop nên trang chủ và chi tiết sản phẩm render sẵn
trên server, có cache (`revalidate: 60` / `300`). Mọi thứ thuộc về người dùng
(giỏ, đơn, profile) đều `no-store`.

Cả hai dùng chung `lib/api/http.ts`:

- `buildPath()` — ghép query, bỏ `undefined`/`null`/chuỗi rỗng, mảng thành nhiều tham số cùng tên.
- `parseResponse()` — ok thì trả JSON, không ok thì ném `ApiError`.
- `ApiError` — giữ `statusCode`, `code`, `message`, `details[]`, `requestId`, và
  có getter `fieldErrors` biến `details[]` thành `{ email: "Email đã tồn tại" }`
  để gắn thẳng vào form.
- `ListResponse<T>` — envelope danh sách của backend:
  `{ data: T[], pagination: { pageIndex, pageSize, totalPages, totalItems } }`.
  **`pageIndex` đếm từ 0.**

## 2.6 Data layer — TanStack Query

Mỗi nhóm nghiệp vụ một file hook trong `src/lib/api/hooks/`:

| File | Phụ trách |
|---|---|
| `use-products.ts` | `/products` công khai + `/manage-product/products` quản trị |
| `use-catalog.ts` | brands, categories, languages (đọc + CRUD) |
| `use-cart.ts` | giỏ hàng |
| `use-orders.ts` | đơn của tôi + `/manage-order/orders` |
| `use-reviews.ts` | đánh giá |
| `use-account.ts` | profile, đổi mật khẩu, OTP, bật/tắt 2FA |
| `use-admin.ts` | users, roles, permissions |
| `use-translations.ts` | brand/category/product translations (3 endpoint, 1 hook) |
| `use-media.ts` | upload ảnh, presigned URL, xóa object |

Khóa cache tập trung ở `src/lib/api/query-keys.ts` — muốn biết một mutation sẽ
làm mới cái gì thì mở file đó. Quy ước: mutation `onSuccess` gọi
`invalidateQueries` theo **tiền tố** (`["cart"]`, `["manage-products"]`), nên mọi
trang/kích thước trang của danh sách đó đều được làm mới.

Lỗi trong form quản trị đi qua `useApiErrors()` (`lib/api/use-error-toast.ts`):
bắn toast đỏ với `message`, đồng thời trả `errors` để `Field` hiển thị dưới từng ô.

## 2.7 Phiên đăng nhập phía client

`SessionProvider` gọi `useProfile(hasSessionCookie)`:

- Không có cookie → không gọi `/profile` (tránh 401 vô ích ở lần vẽ đầu tiên).
- Có cookie → `GET /profile`, `staleTime` 60 giây, không retry.

Mọi component đọc phiên qua `useSession()` → `{ profile, isLoading, isAuthenticated }`.

Quyền nằm ở `profile.role.permissions[].key`, dạng `resource:action:scope`
(ví dụ `product:create:any`). `src/lib/auth/permissions.ts` cung cấp:

- `hasPermission(profile, ...keys)` — đúng nếu có **ít nhất một** key.
- `ADMIN_SECTION_PERMISSIONS` — bản đồ mục admin → danh sách key mở khóa nó.
- `canSee(profile, section)` — dùng cho sidebar và `AdminGuard`.
- `canAccessAdmin(profile)` — có bất kỳ mục nào thì hiện link "Quản trị" trong menu.

Đây chỉ là lớp ẩn giao diện. **API vẫn kiểm quyền trên từng lời gọi** — bỏ qua
`AdminGuard` cũng chỉ nhận về một trang toàn 403.

## 2.8 i18n

- Locale URL: `vi` (mặc định) và `en`, luôn có prefix (`localePrefix: "always"`).
- Backend lại đặt tên thư mục i18n là `en` / **`vn`**, nên mọi request đính header
  `x-lang` đã map qua `apiLanguageByLocale` (`vi → vn`).
- Chuỗi giao diện nằm ở `messages/vi.json` và `messages/en.json`, cùng bộ khóa.
- Điều hướng **phải** dùng `Link` / `useRouter` / `usePathname` xuất từ
  `src/i18n/navigation.ts`, không dùng `next/link` — nếu không sẽ mất prefix locale.
- Nội dung từ API (tên brand/category/product) có bảng `*Translations`.
  `lib/api/translate.ts` chọn bản dịch theo locale, thiếu thì rơi về `en`, thiếu
  nữa thì lấy tên gốc — catalogue dịch dở vẫn hiển thị được.
- `LocaleSwitcher` gọi `router.replace(pathname, { locale })`, nên đổi ngôn ngữ
  giữ nguyên trang đang đứng, kể cả trang có `[id]`.

## 2.9 Giao diện

- **Tailwind v4** + **shadcn/ui** trên nền **Base UI**. Component nền ở
  `src/components/ui/`, coi như hạ tầng.
- Token màu/typography lấy từ `design-system/ecom-web/MASTER.md`
  (style *Vibrant & Block-based*, primary `#059669`, CTA `#EA580C`).
- Một sai lệch có chủ đích: MASTER chọn font Rubik, nhưng Rubik không có subset
  `vietnamese` → heading dùng **Be Vietnam Pro**, body dùng Nunito Sans.
- Các mảnh dùng lại nhiều nhất trong `src/components/common/`:
  `Field` (label + hint + lỗi), `PaginationBar`, `NativeSelect`, `RemoteImage`
  (ảnh hỏng → placeholder), `ConfirmButton` (hộp xác nhận trước khi xóa),
  `OrderStatusBadge`, `StarRating`, `EmptyState` / `ErrorState` / skeleton.
- Trạng thái đơn hàng luôn có **chữ trước, màu sau** — màu không bao giờ là tín
  hiệu duy nhất.
