# 4. Màn hình quản trị

11 màn dưới `/{locale}/admin`. Chúng chia nhau một bộ khung, nên đọc phần 4.1 là
hiểu 90% các màn còn lại; từ 4.3 trở đi chỉ ghi phần khác biệt.

## 4.1 Khung chung

**Layout** (`app/[locale]/admin/layout.tsx`): sidebar trái (trên mobile cuộn
ngang ở đầu trang) + header phải chứa `LocaleSwitcher` và `UserMenu` + vùng nội dung.

**AdminSidebar** liệt kê 11 mục nhưng **lọc theo quyền**: mục nào
`canSee(profile, section)` sai thì không render. Mục đang mở được tô nền
(`/admin` so khớp tuyệt đối, các mục khác dùng `startsWith`). Cuối sidebar là
link *Về cửa hàng*.

**AdminGuard** bọc mọi trang. Đang tải phiên → skeleton. Không đủ quyền → hộp đỏ
"không có quyền". Đây chỉ là lớp ẩn giao diện; **API mới là nơi chặn thật**.

**Các mảnh dùng lại**

| Thành phần | Việc |
|---|---|
| `AdminPage` | tiêu đề + nút hành động bên phải + ô tìm kiếm (nếu truyền `onKeywordChange`) |
| `DataTable` | bảng có `columns`/`rows`; đang tải → skeleton; rỗng → một hàng "trống" |
| `FormDialog` | hộp thoại chứa `<form>`, nút *Hủy* + *Lưu*, cuộn được khi form dài |
| `RowActions` | cụm nút *Sửa* + *Xóa* ở cột cuối; xóa luôn đi qua hộp xác nhận |
| `PaginationBar` | đổi trang + đổi số dòng (10/20/50/100) |
| `useApiErrors` | toast lỗi + map `details[]` vào từng ô |

**Nhịp thao tác giống nhau ở mọi màn CRUD**: nút *Tạo* mở dialog rỗng → *Sửa* ở
một hàng mở dialog đã điền sẵn → submit gọi `POST` (tạo) hoặc `PUT` (sửa) →
toast → đóng dialog → danh sách tự làm mới.

## 4.2 Bảng quyền

`src/lib/auth/permissions.ts` — có **ít nhất một** key trong hàng là thấy mục đó.

| Mục | Key mở khóa |
|---|---|
| products | `product:read:any`, `product:read:own`, `product:create:any` |
| brands | `brand:read:any` |
| categories | `category:read:any` |
| translations | `brand-translation:read:any`, `category-translation:read:any`, `product-translation:read:own` |
| languages | `language:read:any` |
| orders | `order-fulfilment:read:any`, `order:read:any` |
| users | `user:read:any` |
| roles | `role:read:any` |
| permissions | `permission:read:any` |
| media | `media:read:any`, `media:upload:own` |

Có bất kỳ mục nào → menu người dùng hiện link *Quản trị* và `/admin` vào được.

---

## 4.3 Dashboard — `/admin`

**File** `components/admin/admin-dashboard.tsx`.

Bốn thẻ số: **Sản phẩm**, **Đơn hàng**, **Người dùng**, **Thương hiệu**. Mỗi thẻ
là một truy vấn danh sách với `pageSize: 1` — chỉ đọc `pagination.totalItems`,
không kéo dữ liệu thừa. Thẻ nào người dùng không có quyền thì không hiện.

Có quyền `orders` thì thêm một khối: số đơn đang ở `PENDING_CONFIRMATION` và dãy
badge liệt kê đủ 6 trạng thái (để nhìn quen bảng màu).

> Đây là dashboard đếm số, **không có biểu đồ hay doanh thu** — API chưa có
> endpoint thống kê.

---

## 4.4 Sản phẩm — `/admin/products`

**File** `products-admin.tsx` + `product-form-dialog.tsx` + `product-form-fields.tsx`.

**Danh sách** `GET /manage-product/products` (20 dòng, tìm theo `keyword`).
Cột: ảnh đầu tiên · tên · thương hiệu · giá gốc · thao tác.

**Dialog** dài, gồm:

| Trường | Ghi chú |
|---|---|
| Tên | bắt buộc |
| `basePrice` / `virtualPrice` | hai ô số. `virtualPrice` là giá gạch để tính % giảm |
| Thương hiệu | select nạp từ `GET /brands` |
| Ảnh | textarea, **mỗi dòng một URL** |
| `publishedAt` | `datetime-local`; **để trống = đăng ngay** (gửi thời điểm hiện tại) |
| Danh mục | checkbox nhiều lựa chọn |
| **Biến thể** | mỗi dòng: tên biến thể (vd `Màu`) + danh sách option **ngăn bởi dấu phẩy** (vd `Đỏ, Xanh`) |
| **SKU** | mỗi dòng: mã SKU, giá, tồn kho, URL ảnh |

Nút **Sinh SKU** lấy tích Descartes của mọi option, nối bằng dấu `-`
(`Đỏ-S`, `Đỏ-M`, `Xanh-S`…), và **giữ nguyên** giá/tồn của SKU trùng tên đã nhập
trước đó.

Khi bấm *Sửa*, hàng trong bảng không mang theo variants/SKUs, nên màn gọi thêm
`GET /manage-product/products/{id}` rồi mới nạp draft — đó là lý do dialog có
một nhịp trễ ngắn khi mở.

Lưu: `POST` hoặc `PUT /manage-product/products/{id}`. Xóa: `DELETE` cùng đường
dẫn. Cả hai đều invalidate `["manage-products"]` **và** `["products"]` để
storefront thấy ngay.

---

## 4.5 Thương hiệu — `/admin/brands`

`GET /brands` · cột: logo · tên · id rút gọn · thao tác.
Dialog hai ô: **Tên** và **Logo** (URL, bắt buộc).
Xóa là **soft delete** — gửi kèm `{ isHardDelete: false }`.

---

## 4.6 Danh mục — `/admin/categories`

`GET /categories` — endpoint này **không phân trang**, trả cả cây, nên màn không
có `PaginationBar` và cũng không có ô tìm kiếm.

Cột: tên · danh mục cha · số danh mục con · thao tác.
Dialog: tên (bắt buộc), logo (URL, tùy chọn), **danh mục cha** (select, có thể
để trống; danh sách đã loại chính nó để không tự làm cha của mình).

---

## 4.7 Bản dịch — `/admin/translations`

**File** `translations-admin.tsx` + `translation-form-dialog.tsx`.

Một màn phục vụ ba endpoint qua dãy tab: **Thương hiệu** (`/brand-translations`),
**Danh mục** (`/category-translations`), **Sản phẩm** (`/product-translations`).
Đổi tab là đổi endpoint, đổi query key, và đổi cả danh sách đối tượng đích.

Cột: tên · mã ngôn ngữ · mô tả · thao tác.

Dialog:

- **Đối tượng** — chỉ hiện khi *tạo mới*; select nạp brand / category / product
  tùy tab. Tên trường gửi lên theo tab: `brandId` / `categoryId` / `productId`.
- **Ngôn ngữ** — select từ `GET /languages`, hiển thị `mã — tên`.
- **Tên** (bắt buộc) và **Mô tả**.

Đây chính là nguồn dữ liệu cho `pickTranslation()` ở storefront: thêm bản dịch
`vn` cho một sản phẩm thì `/vi/products/...` sẽ hiện tên tiếng Việt.

---

## 4.8 Ngôn ngữ — `/admin/languages`

`GET /languages` (100 bản ghi, `staleTime` 5 phút, không phân trang trên UI).
Cột: mã · tên · thao tác.

Hai điều dễ vấp:

- **Tạo** dùng `POST /languages/create` chứ không phải `POST /languages`.
- **Mã là khóa chính**, chỉ nhập được lúc tạo; sửa thì ô mã biến mất.

Backend đang dùng mã `en` và `vn` — xem [02-architecture.md](02-architecture.md#28-i18n).

---

## 4.9 Đơn hàng — `/admin/orders`

**File** `orders-admin.tsx` · `GET /manage-order/orders`.

Lọc theo **trạng thái** (select ở góc trên) và tìm theo `keyword`.
Cột: id rút gọn (bấm vào mở dialog chi tiết) · ngày tạo · badge trạng thái ·
**select đổi trạng thái**.

Đổi trạng thái ngay trên hàng: chọn giá trị mới → `PUT
/manage-order/orders/{id}/status` → toast → làm mới cả danh sách lẫn chi tiết.
Không có bước xác nhận — chọn nhầm thì chọn lại.

Dialog chi tiết gọi `GET /manage-order/orders/{id}`, liệt kê từng món (ảnh, tên,
`skuValue × số lượng`, thành tiền) và một nút *Đóng*.

---

## 4.10 Người dùng — `/admin/users`

`GET /users` · cột: tên · email · badge vai trò · badge trạng thái · thao tác.

Dialog:

| Trường | Ghi chú |
|---|---|
| Email | **chỉ khi tạo mới**, sửa thì không đổi được |
| Tên, Số điện thoại | bắt buộc |
| Mật khẩu | bắt buộc khi tạo; khi sửa là tùy chọn — bỏ trống nghĩa là giữ nguyên |
| Avatar | URL, tùy chọn |
| Vai trò | select nạp từ `GET /roles` (100 bản ghi) |
| Trạng thái | `ACTIVE` / `INACTIVE` / `BLOCKED` |

Tạo `POST /users`, sửa `PUT /users/{id}`, xóa `DELETE /users/{id}`.

---

## 4.11 Vai trò — `/admin/roles`

`GET /roles` · cột: tên · mô tả · badge (đang bật / hệ thống) · thao tác.

**Vai trò hệ thống (`isSystem`) không xóa được** — nút xóa bị khóa và tooltip đổi
thành lời giải thích.

Dialog: tên, mô tả, công tắc *Đang bật*, và danh sách **quyền** — checkbox cuộn
được, nạp `GET /permissions` (200 bản ghi), nhãn là `key` dạng mono.

Danh sách roles không kèm quyền, nên khi mở *Sửa* màn gọi thêm `GET /roles/{id}`
để tick sẵn. Trong lúc chờ, state `permissionIds` rỗng và UI dùng tạm danh sách
từ bản ghi vừa nạp.

Xóa là soft delete (`{ isHardDelete: false }`).

---

## 4.12 Quyền — `/admin/permissions`

**Chỉ đọc.** `GET /permissions` (50 dòng/trang), có ô tìm kiếm.
Cột: `key` · resource · action · scope · các vai trò đang giữ quyền đó.
Không có nút tạo/sửa/xóa — muốn thay đổi thì gán quyền cho vai trò ở 4.11.

---

## 4.13 Kho ảnh — `/admin/media`

**File** `media-admin.tsx`. Bốn ô công cụ, ánh xạ 1-1 với các endpoint media:

| Ô | Endpoint | Chi tiết |
|---|---|---|
| Tải một ảnh | `POST /media/upload/image` | field `image`, chấp nhận PNG/JPEG |
| Tải nhiều ảnh | `POST /media/upload/array-of-images` | field `files`, **tối đa 10** |
| Nhiều field | `POST /media/upload/multiple-images` | `file1` (1 file) + `file3` (tối đa 3) |
| Presigned URL | `GET /media/presigned-url` | nhập `key` + `type` (mặc định `image/png`) |

Ô thứ tư còn có một form nhỏ **xóa object** theo `key` → `DELETE /media/delete`.

Mọi URL trả về được gom vào một lưới ở dưới (**giữ tối đa 24 URL, chỉ trong
phiên làm việc, tải lại trang là mất**), mỗi ô có nút *Sao chép* để dán vào form
sản phẩm hoặc thương hiệu.

> Đây không phải một media library thật sự — API không có endpoint liệt kê các
> file đã upload.
