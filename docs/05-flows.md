# 5. Luồng hoạt động

Phần này nối các màn lại với nhau. Đọc sau khi đã lướt qua mục 3 và 4.

## 5.1 Bản đồ điều hướng

```mermaid
flowchart LR
  home["/ Trang chủ"] --> list["/products"]
  home --> reg["/register"]
  list --> detail["/products/:id"]
  detail --> cart["/cart"]
  cart --> checkout["/checkout?ids="]
  checkout --> odetail["/orders/:id"]
  orders["/orders"] --> odetail
  login["/login"] --> home
  login --> forgot["/forgot-password"]
  login --> reg
  reg --> login
  forgot --> login
  login -. "Google" .-> oauth["/oauth/google"]
  oauth --> home
  menu(("UserMenu")) --> account["/account"]
  menu --> orders
  menu --> admin["/admin"]
```

Nét đứt = chuyển hướng tự động, không do người dùng bấm.

## 5.2 Mua hàng đầu-cuối

```mermaid
sequenceDiagram
  participant U as Người mua
  participant FE as ecom-web
  participant API as NestJS
  U->>FE: mở /products, lọc, chọn sản phẩm
  FE->>API: GET /products/{id}
  U->>FE: chọn SKU + số lượng, "Thêm vào giỏ"
  alt chưa đăng nhập
    FE-->>U: đẩy sang /login
  else đã đăng nhập
    FE->>API: POST /cart
    FE-->>U: toast "đã thêm", CartBadge +1
  end
  U->>FE: /cart, tick các dòng, "Thanh toán"
  FE-->>U: /checkout?ids=a,b
  U->>FE: "Đặt hàng"
  FE->>API: POST /orders { cartItemIds }
  API-->>FE: đơn mới (PENDING_CONFIRMATION)
  FE-->>U: /orders/{id}
```

Điểm đáng nhớ:

- Món hàng **không** vào giỏ khi chưa đăng nhập — bấm là bị đẩy sang `/login`,
  và **không** có cơ chế nhớ lại món đang xem để thêm hộ sau khi đăng nhập.
- `checkout` không tự lấy cả giỏ; nó chỉ nhận đúng các id trên URL.
- Đặt hàng xong, `["cart"]` và `["orders"]` đều bị invalidate nên giỏ và danh
  sách đơn tự cập nhật.

## 5.3 Vòng đời đơn hàng

```
PENDING_CONFIRMATION ──► PENDING_PICKUP ──► PENDING_DELIVERY ──► DELIVERED
         │                      │                                    │
         └──── CANCELLED ◄──────┘                                RETURNED
```

| Ai | Làm được gì |
|---|---|
| Người mua | Hủy đơn, **chỉ khi** trạng thái là `PENDING_CONFIRMATION` hoặc `PENDING_PICKUP` (`PUT /orders/{id}/cancel`) |
| Quản trị | Đặt đơn sang **bất kỳ** trạng thái nào trong 6 giá trị, bằng select trên hàng (`PUT /manage-order/orders/{id}/status`) |

FE không ràng buộc thứ tự chuyển trạng thái — mọi quy tắc nằm ở backend.

## 5.4 Đăng ký (có OTP)

```mermaid
sequenceDiagram
  participant U as Khách
  participant FE as ecom-web
  participant API as NestJS
  participant M as Email
  U->>FE: điền email, bấm "Gửi OTP"
  FE->>API: POST /auth/otp { email, type: REGISTER }
  API->>M: gửi mã 6 số
  U->>FE: điền phần còn lại + mã
  FE->>API: POST /auth/register
  API-->>FE: 201
  FE-->>U: toast + chuyển sang /login
```

Đăng ký **không** tự đăng nhập. Nếu mã sai/hết hạn, backend trả `details[]` và
form tô đỏ đúng ô `code`.

Quên mật khẩu chạy y hệt, chỉ khác `type: FORGOT_PASSWORD` và endpoint cuối là
`POST /auth/forgot-password`.

## 5.5 Đăng nhập và nơi token dừng lại

```mermaid
sequenceDiagram
  participant B as Browser
  participant N as Next route handler
  participant API as NestJS
  B->>N: POST /api/auth/login { email, password, totpCode? }
  N->>API: POST /auth/login
  API-->>N: { accessToken, refreshToken }
  N-->>B: { ok: true } + Set-Cookie ecom_at, ecom_rt (httpOnly)
  B->>B: queryClient.clear(), router.replace(next ?? "/")
```

Token dừng ở route handler. Browser chỉ biết "thành công hay không".
Nếu Nest trả về thiếu một trong hai token, handler trả 502 `MALFORMED_LOGIN_RESPONSE`.

**2FA**: tài khoản đã bật thì `POST /auth/login` sẽ trả lỗi nếu thiếu `totpCode`;
người dùng nhập mã 6 số từ app authenticator vào ô thứ ba rồi gửi lại.

## 5.6 Đăng nhập Google

```mermaid
sequenceDiagram
  participant U as Khách
  participant FE as ecom-web
  participant API as NestJS
  participant G as Google
  U->>FE: bấm "Google"
  FE->>API: GET /auth/google/authorization-url
  API-->>FE: { url }
  FE->>G: window.location = url
  G->>API: callback
  API->>FE: redirect /{locale}/oauth/google?accessToken=…&refreshToken=…
  FE->>FE: POST /api/auth/google → cookie httpOnly
  FE-->>U: replace("/") — token rời khỏi thanh địa chỉ
```

Thất bại (Nest gắn `errorMessage`, hoặc thiếu token) → thẻ đỏ + nút về `/login`.

## 5.7 Access token hết hạn giữa chừng

Đây là luồng ít thấy nhất nhưng quan trọng nhất.

```mermaid
sequenceDiagram
  participant B as Browser
  participant P as /api/proxy
  participant API as NestJS
  B->>P: GET /api/proxy/orders
  P->>API: GET /orders (Bearer ecom_at hết hạn)
  API-->>P: 401
  P->>API: POST /auth/refresh-token { ecom_rt }
  alt refresh thành công
    API-->>P: cặp token mới
    P->>API: GET /orders (token mới)
    API-->>P: 200
    P-->>B: 200 + Set-Cookie (cả hai cookie được làm mới)
  else refresh thất bại
    P-->>B: 401 + xóa cookie → lần điều hướng sau middleware đá về /login
  end
```

Chỉ thử refresh **một lần** cho mỗi request. Không có hàng đợi gom request —
nếu nhiều request cùng 401 một lúc thì mỗi cái tự refresh, và cái cuối cùng ghi
đè cookie.

## 5.8 Quyền quyết định người dùng thấy gì

```mermaid
flowchart TD
  A[GET /profile] --> B[profile.role.permissions]
  B --> C{canAccessAdmin?}
  C -- không --> D[UserMenu ẩn link Quản trị<br/>vào /admin thấy hộp 'không có quyền']
  C -- có --> E[Sidebar chỉ hiện mục canSee = true]
  E --> F[AdminGuard section kiểm lại trên từng trang]
  F --> G[API kiểm lần cuối trên mỗi request]
```

Ba lớp, lớp cuối mới là lớp thật. Ẩn nút chỉ để người dùng không bấm vào thứ
chắc chắn trả 403.

## 5.9 Đổi ngôn ngữ

Bấm `LocaleSwitcher` → `router.replace(pathname, { locale })`. `pathname` từ
`@/i18n/navigation` đã bỏ prefix locale và giữ nguyên segment động, nên đang ở
`/vi/products/abc` sẽ sang đúng `/en/products/abc`.

Đổi ngôn ngữ kéo theo:

1. Chuỗi giao diện đổi file (`messages/en.json`).
2. Cookie `NEXT_LOCALE` đổi → proxy và `apiServer` gửi `x-lang` mới → thông báo
   lỗi từ backend cũng đổi ngôn ngữ.
3. Nội dung catalogue chọn lại bản dịch qua `pickTranslation` (`vi → vn`, thiếu
   thì `en`, thiếu nữa thì tên gốc).

## 5.10 Đăng xuất

`UserMenu` → `POST /api/auth/logout` → Nest thu hồi thiết bị → cookie bị xóa →
`queryClient.clear()` → toast → `replace("/")` + `refresh()`.

Nếu gọi Nest hỏng (mất mạng), cookie **vẫn** bị xóa: không để UI tiếp tục hiển
thị trạng thái đã đăng nhập trong khi phiên đã kết thúc về mặt ý định.
