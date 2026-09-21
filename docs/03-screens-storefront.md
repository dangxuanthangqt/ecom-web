# 3. Màn hình phía người mua

12 màn. Mỗi mục có: đường dẫn, file, ai vào được, dữ liệu lấy từ đâu, thành phần
trên màn, người dùng làm được gì, và màn xử lý trạng thái rỗng/lỗi thế nào.

Khung chung của nhóm này (`(storefront)/layout.tsx`): `SiteHeader` dính trên
cùng — `main` — `SiteFooter`.

**SiteHeader** (`components/storefront/site-header.tsx`) có: nút menu hamburger
(chỉ mobile, mở `Sheet` trái), logo về trang chủ, link *Trang chủ* / *Sản phẩm*
(link đang mở được tô nền), ô tìm kiếm (chỉ từ `lg`, submit đẩy sang
`/products?keyword=...`), `LocaleSwitcher`, `CartBadge`, `UserMenu`.

**CartBadge** chỉ gọi `GET /cart` khi đã đăng nhập; số trên huy hiệu là **số dòng
hàng**, không phải tổng số lượng.

**UserMenu**: chưa đăng nhập hiện *Đăng nhập* + *Đăng ký*; đã đăng nhập hiện
dropdown gồm email, *Hồ sơ*, *Đơn hàng*, *Quản trị* (chỉ khi `canAccessAdmin`),
*Đăng xuất*. Đăng xuất gọi `POST /api/auth/logout`, `queryClient.clear()`, toast,
rồi `replace("/")` + `refresh()`.

---

## 3.1 Trang chủ — `/`

**File** `app/[locale]/(storefront)/page.tsx` · **Server Component** · công khai.

**Dữ liệu** — hai lời gọi song song qua `apiServer`, cả hai đều `.catch(() => null)`
nên backend chết thì trang vẫn dựng được:

| Gọi | Query | Cache |
|---|---|---|
| `GET /products` | 8 bản ghi, `orderBy=createdAt&order=desc` | `revalidate: 60` |
| `GET /brands` | 12 bản ghi | `revalidate: 300` |

**Bố cục**

1. **Hero** — badge, tiêu đề, phụ đề, nút *Mua ngay* (→ `/products`) và nút phụ
   (→ `/register`); bên phải 4 thẻ cam kết (giao nhanh, đổi trả, thanh toán an
   toàn, hỗ trợ).
2. **Sản phẩm nổi bật** — lưới `ProductCard`, 2 cột mobile → 4 cột desktop.
   4 ảnh đầu đặt `priority` để không trễ LCP.
3. **Thương hiệu** — dãy chip, bấm vào đi `/products?brandIds=<id>`. Không có
   brand thì cả section biến mất.
4. **CTA cuối** — nút về `/register`.

**ProductCard** hiển thị: ảnh đầu tiên, huy hiệu `-X%` khi `basePrice <
virtualPrice`, tên brand, tên sản phẩm (đã chọn bản dịch theo locale), giá và
giá gạch. Cả thẻ là một link tới `/products/[id]`.

---

## 3.2 Danh sách sản phẩm — `/products`

**File** `(storefront)/products/page.tsx` → `components/storefront/product-browser.tsx`
· server page đọc `searchParams` rồi giao cho client component · công khai.

**Query khởi tạo** lấy từ URL: `keyword`, `brandIds`, `categoryIds` (chấp nhận
lặp tham số). Mặc định `pageIndex 0`, `pageSize 20`, `orderBy createdAt`, `order desc`.

**Dữ liệu** `useProducts(query)` → `GET /products`.

**Bên trái — ProductFilters** (`product-filters.tsx`), trên mobile là nút *Bộ lọc*
đóng/mở:

| Bộ lọc | Chi tiết |
|---|---|
| Sắp xếp theo | `createdAt`, `name`, `basePrice`, `publishedAt`, `updatedAt`, `virtualPrice`, `sale` |
| Thứ tự | giảm dần / tăng dần |
| Khoảng giá | hai ô số `minPrice` / `maxPrice` |
| Thương hiệu | checkbox, nạp từ `GET /brands` (100 bản ghi) |
| Danh mục | checkbox — **chỉ hiện khi đã đăng nhập**, vì `GET /categories` cần auth |
| Xóa lọc | đưa về query mặc định và xóa ô tìm kiếm |

Mọi thay đổi bộ lọc đều đặt lại `pageIndex: 0`.

**Bên phải** — tiêu đề kèm tổng số kết quả, ô tìm kiếm riêng (submit mới áp
dụng, không gõ tới đâu gọi tới đó), lưới `ProductCard`, `PaginationBar` (đổi
trang + đổi số dòng 10/20/50/100).

**Trạng thái** — đang tải: `CardGridSkeleton`. Lỗi: `ErrorState` có nút *Thử lại*
gọi `refetch()`. Không có kết quả: `EmptyState`.

> Lưu ý: bộ lọc nằm trong state React, **không ghi ngược lên URL**. Reload trang
> sẽ quay về query mặc định (trừ phần đọc từ `searchParams` lúc vào).

---

## 3.3 Chi tiết sản phẩm — `/products/[id]`

**File** `(storefront)/products/[id]/page.tsx` · Server Component · công khai.

**Dữ liệu** `GET /products/{id}` với `revalidate: 60`. 404 → trang `notFound()`
của Next; lỗi khác thì ném ra để error boundary xử lý. `generateMetadata` đặt
tiêu đề tab theo tên sản phẩm.

**Bố cục** hai cột từ `lg`:

- **Trái — ProductGallery**: ảnh lớn + dải 5 thumbnail; thumbnail đang chọn viền
  màu primary. Một ảnh thì không hiện dải.
- **Phải**: badge brand → tiêu đề → **ProductPurchasePanel** → bảng *Thông số*
  (mỗi `variant` một ô: tên biến thể và các option) → *Mô tả* (lấy bản dịch theo
  locale, rỗng thì hiện câu thay thế).
- **Dưới cùng — ProductReviews**.

### ProductPurchasePanel

| Phần | Hành vi |
|---|---|
| Giá | giá của SKU đang chọn; nếu `virtualPrice` lớn hơn thì hiện giá gạch bên cạnh |
| Chọn SKU | các nút chip; SKU hết hàng bị `disabled`; đổi SKU đặt lại số lượng về 1 |
| Tồn kho | "còn N" hoặc "hết hàng" |
| Số lượng | nút −/+ và ô số, kẹp trong khoảng 1…stock |
| *Thêm vào giỏ* | chưa đăng nhập → đẩy sang `/login`; đã đăng nhập → `POST /cart` rồi toast |
| *Mua ngay* | như trên, thêm một bước chuyển sang `/cart` |

### ProductReviews

`GET /reviews?productId=...` 10 bản ghi mỗi trang, mới nhất trước.

- Đầu mục hiện **sao trung bình của trang hiện tại** và tổng số đánh giá.
- Đã đăng nhập → có form: chọn số sao (5→1) và nội dung. Gửi = `POST /reviews`.
- Chưa đăng nhập → chỉ một dòng link mời đăng nhập.
- Đánh giá của **chính mình** (`profile.id === review.userId`) có nút *Sửa*
  (nạp ngược vào form, gửi thành `PUT /reviews/{id}`) và *Xóa* (qua `ConfirmButton`).
- Phân trang là hai nút trước/sau đơn giản, chỉ hiện khi có nhiều hơn một trang.

---

## 3.4 Giỏ hàng — `/cart`

**File** `(storefront)/cart/page.tsx` → `components/storefront/cart-view.tsx`
· **cần đăng nhập** (middleware chặn).

**Dữ liệu** `GET /cart?pageIndex=0&pageSize=50`.

**Trái** — checkbox *Chọn tất cả*, rồi danh sách dòng hàng. Mỗi dòng: checkbox,
ảnh SKU, tên sản phẩm (link về chi tiết), giá trị SKU, đơn giá, cụm −/số lượng/+,
nút *Xóa*.

- Nút − tắt khi số lượng = 1; nút + tắt khi chạm `sku.stock`, kèm dòng cảnh báo
  "chỉ còn N".
- Đổi số lượng = `PUT /cart/{id}`; xóa = `DELETE /cart/{id}`. Cả hai đều
  invalidate `["cart"]`.

**Phải — hộp tổng kết** (dính khi cuộn ở desktop): số món đã chọn, **tổng tiền
chỉ tính các dòng được tick**, nút *Thanh toán* → `/checkout?ids=<id1,id2,...>`.
Chưa tick gì thì nút bị khóa.

Giỏ rỗng → `EmptyState` kèm nút sang `/products`.

> Lựa chọn chỉ nằm trong state; rời trang rồi quay lại là mất tick. Danh sách
> `selected` cũng được lọc lại theo giỏ hiện tại, nên món vừa bị xóa không còn
> tính vào tổng.

---

## 3.5 Đặt hàng — `/checkout?ids=...`

**File** `(storefront)/checkout/page.tsx` → `checkout-view.tsx` · cần đăng nhập.

Đọc `ids` từ query (chuỗi id ngăn bởi dấu phẩy), nạp lại giỏ rồi **lọc đúng
những dòng đó**. Không dòng nào khớp → `EmptyState` "chưa chọn gì" + nút quay lại giỏ.

**Màn gồm**: tiêu đề, hộp *Tóm tắt* liệt kê từng món (ảnh, tên, `sku × số lượng`,
thành tiền), dòng tổng, một dòng ghi chú, và nút *Đặt hàng* chiếm hết chiều ngang.

Đặt hàng = `POST /orders` với `{ cartItemIds }` → invalidate cả `["cart"]` và
`["orders"]` → toast → chuyển sang `/orders/{id}` của đơn vừa tạo.

> Màn này **không có** form địa chỉ hay thanh toán: API hiện tại tạo đơn thẳng từ
> danh sách `cartItemIds`.

---

## 3.6 Đơn của tôi — `/orders`

**File** `(storefront)/orders/page.tsx` → `order-list.tsx` · cần đăng nhập.

`GET /orders` 10 bản ghi/trang, mới nhất trước, kèm bộ lọc **Trạng thái** (một
`NativeSelect`, mặc định *Tất cả*, 6 giá trị: `PENDING_CONFIRMATION`,
`PENDING_PICKUP`, `PENDING_DELIVERY`, `DELIVERED`, `RETURNED`, `CANCELLED`).

Mỗi đơn là một thẻ bấm được: `#` 8 ký tự đầu của id, thời điểm đặt, và
`OrderStatusBadge`. Bấm vào đi `/orders/{id}`. Rỗng → `EmptyState`. Dưới cùng là
`PaginationBar`.

---

## 3.7 Chi tiết đơn — `/orders/[id]`

**File** `(storefront)/orders/[id]/page.tsx` → `order-detail-view.tsx` · cần đăng nhập.

`GET /orders/{id}`. Lỗi → `ErrorState` có nút thử lại.

Gồm: nút *Quay lại* danh sách, tiêu đề `#<8 ký tự>` + thời điểm đặt + badge trạng
thái, danh sách món (ảnh snapshot, tên sản phẩm lúc đặt, `skuValue × số lượng`,
thành tiền), và khối **Tổng cộng** — tổng được **cộng lại từ các dòng** chứ
không đọc một trường tổng nào của API.

**Hủy đơn**: nút đỏ chỉ hiện khi trạng thái là `PENDING_CONFIRMATION` hoặc
`PENDING_PICKUP`. Bấm → hộp xác nhận → `PUT /orders/{id}/cancel` → toast, danh
sách và chi tiết đều được làm mới.

---

## 3.8 Tài khoản — `/account`

**File** `(storefront)/account/page.tsx` → `account-view.tsx` · cần đăng nhập.

Đọc `profile` từ `useSession()`; chưa có thì hiện skeleton.

**Đầu trang**: email, badge vai trò, badge trạng thái tài khoản.

**Ba khối**:

1. **Hồ sơ** — tên, số điện thoại, URL avatar → `PUT /profile`. Thành công thì
   toast và invalidate `["profile"]`.
2. **Đổi mật khẩu** — mật khẩu hiện tại, mật khẩu mới, nhập lại (tối thiểu 6 ký
   tự). Hai ô mới lệch nhau thì báo lỗi ngay tại chỗ, không gọi API. Gửi đi là
   `PUT /profile/change-password`, thành công thì reset form.
3. **TwoFactorPanel** — xem 3.9.

Lỗi từ API được gắn vào đúng ô nhờ `ApiError.fieldErrors`.

---

## 3.9 Xác thực hai lớp (nằm trong `/account`)

**File** `components/storefront/two-factor-panel.tsx`.

| Nút / ô | Việc |
|---|---|
| *Bật 2FA* | `POST /auth/2fa/enable` → trả `{ secret, uri }`; màn hiện secret dạng mono và link `otpauth://` để quét |
| *Gửi OTP* | `POST /auth/otp` với `type: "DISABLE_2FA"` — dùng khi mất app authenticator |
| Form tắt 2FA | hai ô: `totpCode` (từ app) và `otpCode` (từ email). Điền **một trong hai** là đủ; nút gửi khóa khi cả hai đều rỗng. Gọi `POST /auth/2fa/disable` |

---

## 3.10 Đăng nhập — `/login`

**File** `(auth)/login/page.tsx` → `components/auth/login-form.tsx`.

Nhận `?next=` (middleware gắn vào khi chặn trang cần đăng nhập).

Form: email, mật khẩu, và `totpCode` (tùy chọn, chỉ cần khi tài khoản bật 2FA).
Submit gọi thẳng **`POST /api/auth/login`** — không qua `apiClient`, vì cặp token
phải biến thành cookie httpOnly trước khi chạm tới React.

- Thất bại → gắn `details[]` vào từng ô + toast đỏ.
- Thành công → `queryClient.clear()` (tránh dùng lại cache của người trước),
  `router.replace(next ?? "/")`, `router.refresh()`.
  `next` chỉ được chấp nhận khi bắt đầu bằng `/` — chặn open-redirect.

Dưới form: nút **Google** và hai link *Quên mật khẩu* / *Đăng ký*.

---

## 3.11 Đăng ký — `/register`

**File** `(auth)/register/page.tsx` → `components/auth/register-form.tsx`.

Các ô: email, tên, số điện thoại, mật khẩu, nhập lại mật khẩu, avatar (URL, tùy
chọn), và **mã OTP** kèm nút *Gửi OTP* ngay bên cạnh.

Thứ tự đúng: điền email → bấm *Gửi OTP* (`POST /auth/otp` với
`type: "REGISTER"`) → mở hộp thư lấy mã → điền nốt → *Đăng ký*.

Kiểm tra phía client: hai ô mật khẩu phải khớp. Gửi đi là `POST /auth/register`
(qua proxy). Thành công → toast → chuyển sang `/login` (đăng ký **không** tự
đăng nhập).

---

## 3.12 Quên mật khẩu — `/forgot-password`

**File** `(auth)/forgot-password/page.tsx` → `forgot-password-form.tsx`.

Email → *Gửi OTP* (`type: "FORGOT_PASSWORD"`) → mã → mật khẩu mới → nhập lại →
`POST /auth/forgot-password`. Xong thì về `/login`.

---

## 3.13 Callback Google — `/oauth/google`

**File** `(auth)/oauth/google/page.tsx` → `components/auth/google-callback.tsx`.

Không phải màn để người dùng thao tác — Nest redirect về đây kèm `accessToken`,
`refreshToken` (hoặc `errorMessage`) trên query string.

Component chạy một effect: `POST /api/auth/google` với cặp token → cookie
httpOnly → `router.replace("/")` + `refresh()`, nên token không nằm lại trên
thanh địa chỉ. Trong lúc đó hiện spinner. Thiếu token hoặc có `errorMessage` →
thẻ đỏ "đăng nhập Google thất bại" kèm nút về `/login`.
