# Tài liệu ecom-web

Frontend Next.js 15 cho API NestJS ở `../ecom`. Một app duy nhất chứa hai mặt:
**storefront** (người mua) và **admin** (người quản trị), song ngữ VI/EN.

Bộ tài liệu này viết cho người **chưa từng đọc code dự án**. Đọc từ trên xuống là
hiểu được: app làm gì, có những màn nào, bấm vào đâu thì chuyện gì xảy ra, và
code nằm ở file nào.

## Thứ tự đọc

| # | Tài liệu | Trả lời câu hỏi |
|---|---|---|
| 1 | [01-getting-started.md](01-getting-started.md) | Cài và chạy thế nào, cần backend gì, đăng nhập bằng tài khoản nào, lỗi hay gặp |
| 2 | [02-architecture.md](02-architecture.md) | App được ghép từ những mảnh nào: routing, token, proxy, data layer, i18n, design token |
| 3 | [03-screens-storefront.md](03-screens-storefront.md) | 12 màn phía người mua — từng màn: dữ liệu, thành phần, hành động, lỗi |
| 4 | [04-screens-admin.md](04-screens-admin.md) | 11 màn phía quản trị — từng màn: quyền cần có, cột bảng, form, API |
| 5 | [05-flows.md](05-flows.md) | Các luồng xuyên màn: đăng ký → mua hàng → nhận hàng, đăng nhập, 2FA, refresh token, đổi ngôn ngữ |
| 6 | [06-user-guide.md](06-user-guide.md) | Hướng dẫn sử dụng từng bước, viết cho người dùng cuối (mua hàng + quản trị) |
| 7 | [07-conventions.md](07-conventions.md) | Muốn thêm một màn / một endpoint / một chuỗi dịch mới thì làm theo khuôn nào |

**Đọc nhanh tối thiểu:** 1 → 2 → 3 → 5.
**QA / BA:** 6 → 3 → 4 → 5.
**Dev sắp sửa code:** 2 → 7 → màn mình đụng tới trong 3 hoặc 4.

## Bản đồ màn hình một trang

Locale luôn nằm ở đầu URL: `/vi/...` hoặc `/en/...`. Vào `/` sẽ bị đẩy về `/vi`.

```
/                           Trang chủ            công khai
/products                   Danh sách sản phẩm   công khai
/products/[id]              Chi tiết sản phẩm    công khai (review cần đăng nhập)
/login                      Đăng nhập            khách
/register                   Đăng ký              khách
/forgot-password            Quên mật khẩu        khách
/oauth/google               Callback Google      khách (tự động chuyển tiếp)
/cart                       Giỏ hàng             cần đăng nhập
/checkout?ids=...           Đặt hàng             cần đăng nhập
/orders                     Đơn của tôi          cần đăng nhập
/orders/[id]                Chi tiết đơn         cần đăng nhập
/account                    Tài khoản + 2FA      cần đăng nhập
/admin                      Dashboard            cần ≥1 quyền quản trị
/admin/products             Sản phẩm             product:*
/admin/brands               Thương hiệu          brand:read:any
/admin/categories           Danh mục             category:read:any
/admin/translations         Bản dịch             *-translation:read:*
/admin/languages            Ngôn ngữ             language:read:any
/admin/orders               Đơn hàng (vận hành)  order-fulfilment / order:read:any
/admin/users                Người dùng           user:read:any
/admin/roles                Vai trò              role:read:any
/admin/permissions          Quyền (chỉ đọc)      permission:read:any
/admin/media                Kho ảnh              media:read:any / media:upload:own
```

Ngoài ra có 4 route handler chạy phía server, không phải màn hình:
`/api/auth/login`, `/api/auth/logout`, `/api/auth/google`, `/api/proxy/[...path]`.

## Quy ước trong bộ tài liệu

- Mọi đường dẫn file tính từ gốc repo `ecom-web/`.
- "API" = NestJS ở `../ecom`, mặc định `http://localhost:4000`.
- Endpoint viết dạng `GET /products` là endpoint **của Nest**, browser gọi nó qua
  `/api/proxy/products`.
