# 7. Quy ước khi viết thêm

Đọc mục này trước khi thêm màn, thêm endpoint hoặc sửa chuỗi hiển thị.

## 7.1 Thêm một màn storefront

1. Tạo `src/app/[locale]/(storefront)/<tên>/page.tsx`. Page là **Server
   Component**, nhiệm vụ của nó chỉ là: `await params`, gọi `setRequestLocale(locale)`,
   rồi render một client component.
2. Phần tương tác đặt ở `src/components/storefront/<tên>-view.tsx` với `"use client"`.
3. Cần dữ liệu tĩnh, cache được (trang chủ, chi tiết sản phẩm) → gọi `apiServer`
   ngay trong page, kèm `revalidate`. Dữ liệu riêng của người dùng → dùng hook
   TanStack Query trong client component.
4. Màn cần đăng nhập → thêm tiền tố vào `PROTECTED_PREFIXES` ở `src/middleware.ts`.
5. Dùng `Link` / `useRouter` từ `@/i18n/navigation`, **không** dùng `next/link`.

## 7.2 Thêm một màn admin

1. `src/app/[locale]/admin/<mục>/page.tsx` — bọc nội dung bằng
   `<AdminGuard section="<mục>">`.
2. Component ở `src/components/admin/<mục>-admin.tsx`, dựng từ `AdminPage` +
   `DataTable` + `FormDialog` + `RowActions` + `PaginationBar`.
3. Khai báo quyền trong `ADMIN_SECTION_PERMISSIONS` (`src/lib/auth/permissions.ts`)
   — nếu không, `AdminGuard` sẽ từ chối và TypeScript sẽ báo `section` không hợp lệ.
4. Thêm mục vào mảng `ITEMS` của `AdminSidebar`.
5. Lỗi form đi qua `useApiErrors()`; đừng tự viết lại chỗ bắt lỗi.

## 7.3 Thêm một endpoint

1. Sinh lại type: `pnpm build:swagger` bên backend rồi chạy `openapi-typescript`
   (xem [01-getting-started.md](01-getting-started.md#sinh-lại-type-khi-api-đổi)).
   **Không sửa tay `src/lib/api/schema.ts`.**
2. Thêm alias dễ đọc vào `src/lib/api/types.ts`.
3. Thêm khóa cache vào `src/lib/api/query-keys.ts`.
4. Viết hook trong `src/lib/api/hooks/use-<nhóm>.ts`:
   - query → `useQuery` + `apiClient.get`
   - mutation → `useMutation`, và `onSuccess` phải `invalidateQueries` theo tiền
     tố của mọi danh sách bị ảnh hưởng.
5. Endpoint sinh/tiêu token thì **không** đi qua `/api/proxy` — viết một route
   handler riêng dưới `src/app/api/auth/` và thêm tên nó vào `TOKEN_ENDPOINTS`
   của proxy.

## 7.4 Chuỗi hiển thị

- Mọi chữ hiện ra màn hình đều nằm trong `messages/vi.json` và `messages/en.json`.
  Không hard-code tiếng Việt trong JSX.
- Hai file phải **cùng bộ khóa**. Thêm khóa ở file này thì thêm cả ở file kia,
  nếu không next-intl sẽ ném lỗi khi đổi ngôn ngữ.
- Nhóm khóa theo màn: `common`, `nav`, `home`, `products`, `reviews`, `cart`,
  `checkout`, `orders`, `auth`, `account`, `admin`, `validation`.
- Trong client component: `useTranslations("products")`. Trong server component:
  `await getTranslations("products")`.

## 7.5 Giao diện

- Ưu tiên component có sẵn ở `src/components/common/` trước khi viết mới:
  `Field`, `NativeSelect`, `RemoteImage`, `ConfirmButton`, `PaginationBar`,
  `EmptyState`, `ErrorState`, `RowsSkeleton`, `CardGridSkeleton`.
- Dùng token màu của design system (`primary`, `cta`, `muted-foreground`,
  `destructive`, `warning`…), không viết mã màu thẳng vào class.
- Ảnh từ bên ngoài luôn qua `RemoteImage` — nó hạ cấp thành placeholder khi link hỏng.
- Trạng thái phải đọc được bằng chữ, màu chỉ là tín hiệu phụ.
- Icon trang trí đặt `aria-hidden="true"`; nút chỉ có icon phải có `aria-label`.

## 7.6 Kích thước và cấu trúc file

- Giữ mỗi file code dưới **200 dòng**. Vượt thì tách: form dài tách thành
  `*-form-dialog.tsx` và `*-form-fields.tsx` (xem cách `products-admin` được chia).
- Tên file **kebab-case**, nói rõ file làm gì.
- Không tạo bản sao "enhanced" của một file — sửa tại chỗ.

## 7.7 Trước khi commit

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build            # khi đụng tới routing, layout hoặc server component
```

Commit theo conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`…), mỗi
commit một phạm vi. Không commit `.env.local`.

## 7.8 Những chỗ đã biết là còn thiếu

Ghi lại để người sau không mất công đi tìm:

| Thiếu | Hiện trạng |
|---|---|
| Địa chỉ giao hàng, thanh toán | Chưa có — `POST /orders` chỉ nhận `cartItemIds` |
| Bộ lọc đồng bộ lên URL | `/products` giữ bộ lọc trong state, reload là mất |
| Nhớ sản phẩm khi bị đẩy sang đăng nhập | Bấm "Thêm vào giỏ" lúc chưa đăng nhập chỉ chuyển trang, không thêm hộ sau đó |
| Danh sách media | API không có endpoint liệt kê file; `/admin/media` chỉ nhớ URL trong phiên |
| Thống kê dashboard | Chỉ đếm `totalItems`, không có doanh thu hay biểu đồ |
| Test E2E | `e2e/` đã có mock API và cấu hình, `e2e/tests/` còn rỗng |
| Sao trung bình của sản phẩm | Tính trên trang đánh giá đang xem, không phải trung bình toàn bộ |
