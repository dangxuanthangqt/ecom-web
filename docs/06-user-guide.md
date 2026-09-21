# 6. Hướng dẫn sử dụng

Viết cho người dùng cuối và cho QA đi test. Không cần biết code.

Địa chỉ mặc định khi chạy local: **http://localhost:3000** — trang sẽ tự chuyển
sang `/vi`. Muốn tiếng Anh thì bấm biểu tượng ngôn ngữ ở góc phải trên, hoặc sửa
`/vi` thành `/en` trên thanh địa chỉ.

---

# Phần A — Người mua hàng

## A1. Dạo cửa hàng (không cần tài khoản)

1. Trang chủ hiện 8 sản phẩm mới nhất và dãy thương hiệu.
2. Bấm **Sản phẩm** trên thanh trên cùng để xem toàn bộ danh sách.
3. Bấm một thương hiệu ở trang chủ để lọc nhanh theo thương hiệu đó.
4. Bấm vào một sản phẩm để xem chi tiết: ảnh, giá, thông số, mô tả, đánh giá.

Xem được hết. Chỉ khi thêm vào giỏ mới cần đăng nhập.

## A2. Tìm và lọc sản phẩm

Ở trang **Sản phẩm**:

| Muốn gì | Làm gì |
|---|---|
| Tìm theo tên | Gõ vào ô tìm kiếm rồi **nhấn Enter** (gõ không thôi chưa tìm) |
| Sắp xếp | Cột trái, *Sắp xếp theo* + *Thứ tự* (tăng/giảm) |
| Khoảng giá | Hai ô số *Giá thấp nhất* – *Giá cao nhất* |
| Theo thương hiệu | Tick checkbox trong mục *Thương hiệu* |
| Theo danh mục | Tick trong mục *Danh mục* — **mục này chỉ hiện khi đã đăng nhập** |
| Bỏ hết bộ lọc | Nút *Xóa lọc* dưới cùng cột trái |
| Xem nhiều hơn | Cuối trang: nút ‹ › và ô chọn số dòng mỗi trang |

Trên điện thoại, bộ lọc gập lại sau nút **Bộ lọc**.

Lưu ý: tải lại trang sẽ mất bộ lọc đang chọn.

## A3. Tạo tài khoản

1. Vào **Đăng ký** (góc phải trên, hoặc nút ở trang chủ).
2. Nhập **email** trước.
3. Bấm **Gửi OTP** — hệ thống gửi mã 6 số vào hộp thư của bạn.
4. Điền nốt: tên, số điện thoại, mật khẩu (≥ 6 ký tự), nhập lại mật khẩu.
   Avatar là đường dẫn ảnh, để trống cũng được.
5. Nhập mã OTP vừa nhận.
6. Bấm **Đăng ký**.

Xong là chuyển sang trang đăng nhập. **Đăng ký không tự đăng nhập**, phải đăng
nhập lại một lần.

*Không nhận được mã?* Kiểm tra thư mục spam, bấm **Gửi OTP** lần nữa. Mã có hạn
sử dụng; nhập mã cũ sẽ báo lỗi ngay dưới ô mã.

## A4. Đăng nhập

- Cách thường: email + mật khẩu → **Đăng nhập**.
- Nếu đã bật xác thực hai lớp: điền thêm **mã TOTP** 6 số từ ứng dụng
  authenticator vào ô thứ ba.
- Cách nhanh: nút **Google** → chọn tài khoản Google → hệ thống tự đưa về trang chủ.

Nếu bạn vừa bị chuyển tới trang đăng nhập từ một trang khác (ví dụ giỏ hàng),
sau khi đăng nhập xong hệ thống trả bạn về đúng trang đó.

## A5. Quên mật khẩu

**Đăng nhập → Quên mật khẩu**: nhập email → **Gửi OTP** → nhập mã → nhập mật
khẩu mới hai lần → **Đặt lại mật khẩu**. Xong thì đăng nhập bằng mật khẩu mới.

## A6. Mua hàng

**Bước 1 — thêm vào giỏ.** Ở trang chi tiết sản phẩm:

1. Chọn phiên bản (SKU) — các nút xám mờ là phiên bản đã hết hàng.
2. Chọn số lượng bằng nút − / + (không vượt quá tồn kho).
3. Bấm **Thêm vào giỏ** (ở lại trang) hoặc **Mua ngay** (thêm rồi sang giỏ luôn).

Chưa đăng nhập thì hệ thống đưa bạn sang trang đăng nhập; sau khi đăng nhập
**bạn phải quay lại và thêm lại sản phẩm**.

**Bước 2 — kiểm giỏ.** Vào **Giỏ hàng** (biểu tượng xe đẩy, có số món ở góc):

- Tick vào những món **muốn mua lần này** — hộp tổng tiền bên phải chỉ cộng các
  món đã tick.
- Sửa số lượng bằng − / +. Chạm trần tồn kho sẽ có dòng nhắc "chỉ còn N".
- Bấm **Xóa** để bỏ một món.
- Bấm **Thanh toán**.

**Bước 3 — đặt hàng.** Trang thanh toán liệt kê đúng những món đã tick và tổng
tiền. Kiểm tra rồi bấm **Đặt hàng**. Hệ thống đưa bạn thẳng tới trang chi tiết
đơn vừa tạo.

> Bản hiện tại chưa có nhập địa chỉ giao hàng và chưa có thanh toán trực tuyến.

## A7. Theo dõi và hủy đơn

**Đơn hàng** (trong menu tài khoản) liệt kê đơn mới nhất trước, có ô lọc theo
trạng thái.

| Trạng thái | Nghĩa |
|---|---|
| Chờ xác nhận | Vừa đặt, cửa hàng chưa duyệt |
| Chờ lấy hàng | Đã duyệt, đang chuẩn bị |
| Chờ giao hàng | Đã bàn giao đơn vị vận chuyển |
| Đã giao | Hoàn tất |
| Đã trả hàng | Khách trả lại |
| Đã hủy | Hủy bởi khách hoặc cửa hàng |

Bấm vào một đơn để xem từng món và tổng tiền. Nút **Hủy đơn** màu đỏ **chỉ xuất
hiện khi đơn còn ở *Chờ xác nhận* hoặc *Chờ lấy hàng***; bấm sẽ có hộp xác nhận.
Qua giai đoạn đó thì phải liên hệ cửa hàng.

## A8. Đánh giá sản phẩm

Ở cuối trang chi tiết sản phẩm, khi đã đăng nhập:

1. Chọn số sao (1–5).
2. Viết nội dung.
3. Bấm **Gửi**.

Đánh giá của chính bạn có thêm nút **Sửa** (nạp lại vào form, sửa rồi gửi) và
**Xóa** (có xác nhận). Đánh giá của người khác thì không.

## A9. Tài khoản và bảo mật

Menu tài khoản → **Hồ sơ**:

- **Hồ sơ**: đổi tên, số điện thoại, ảnh đại diện → *Cập nhật*.
- **Đổi mật khẩu**: mật khẩu hiện tại + mật khẩu mới (2 lần). Hai ô mới không
  khớp sẽ báo lỗi ngay, chưa gửi đi đâu cả.
- **Xác thực hai lớp**:
  - *Bật 2FA* → màn hiện một **mã bí mật** và một liên kết `otpauth://`. Nhập mã
    đó vào Google Authenticator / Authy. Từ lần đăng nhập sau, bạn cần nhập thêm
    mã 6 số.
  - *Tắt 2FA* → điền **một trong hai**: mã 6 số từ app (ô *TOTP*), hoặc mã OTP
    gửi qua email (bấm *Gửi OTP* trước, rồi điền vào ô *OTP*). Dùng cách thứ hai
    khi đã mất điện thoại.

## A10. Đăng xuất

Menu tài khoản → **Đăng xuất**. Phiên bị thu hồi trên máy chủ và mọi dữ liệu đã
tải về trong trình duyệt bị xóa khỏi bộ nhớ tạm.

---

# Phần B — Người quản trị

Vào bằng menu tài khoản → **Quản trị**, hoặc gõ thẳng `/vi/admin`.
Link này chỉ hiện nếu tài khoản có ít nhất một quyền quản trị. Không có quyền mà
cố vào sẽ thấy hộp đỏ "không có quyền".

**Menu bên trái chỉ liệt kê những mục bạn có quyền** — đồng nghiệp thấy nhiều
mục hơn bạn là chuyện bình thường, không phải lỗi.

## B1. Thao tác chung

Mọi trang quản trị dùng chung một nhịp:

1. **Tìm** — ô tìm kiếm dưới tiêu đề (một số trang không có, vì endpoint không
   phân trang).
2. **Tạo** — nút cam góc phải trên, mở hộp thoại trống.
3. **Sửa** — biểu tượng bút chì ở cuối mỗi hàng, mở hộp thoại đã điền sẵn.
4. **Xóa** — biểu tượng thùng rác, **luôn có hộp xác nhận**.
5. **Phân trang** — cuối bảng: nút ‹ › và ô chọn 10 / 20 / 50 / 100 dòng.

Thành công thì có thông báo xanh góc phải. Thất bại thì có thông báo đỏ, và
những ô nhập sai sẽ có chữ đỏ ngay bên dưới.

## B2. Bảng điều khiển

Bốn thẻ đếm: sản phẩm, đơn hàng, người dùng, thương hiệu — chỉ hiện thẻ bạn có
quyền xem. Bên dưới là số đơn **đang chờ xác nhận** và bảng màu 6 trạng thái.

## B3. Quản lý sản phẩm

Tạo hoặc sửa một sản phẩm, theo thứ tự này:

1. **Tên**, **giá gốc**, **giá gạch** (để hiện phần trăm giảm ở cửa hàng).
2. **Thương hiệu** — chọn trong danh sách. Chưa có thì tạo ở mục *Thương hiệu* trước.
3. **Ảnh** — dán URL, **mỗi dòng một ảnh**. Ảnh đầu tiên là ảnh đại diện. Chưa
   có link thì sang mục *Kho ảnh* tải lên rồi sao chép URL về.
4. **Ngày đăng** — để trống là đăng ngay.
5. **Danh mục** — tick những danh mục phù hợp.
6. **Biến thể** — ví dụ: biến thể `Màu` với các lựa chọn `Đỏ, Xanh`; biến thể
   `Size` với `S, M, L`. Các lựa chọn **ngăn nhau bằng dấu phẩy**.
7. **SKU** — bấm **Sinh SKU** để hệ thống tự tạo đủ tổ hợp (`Đỏ-S`, `Đỏ-M`, …),
   rồi điền **giá** và **tồn kho** cho từng dòng. Có thể thêm/xóa dòng thủ công.
8. **Lưu**.

Sản phẩm xuất hiện ở cửa hàng ngay sau khi lưu.

*Muốn bán một sản phẩm không có biến thể?* Vẫn cần ít nhất một SKU để khách bấm
được "Thêm vào giỏ" — tạo một dòng SKU duy nhất với giá và tồn kho.

## B4. Thương hiệu, danh mục, ngôn ngữ

- **Thương hiệu**: tên + URL logo. Xóa là xóa mềm.
- **Danh mục**: tên, logo (tùy chọn), và **danh mục cha** để dựng cây. Bảng cho
  biết mỗi danh mục có bao nhiêu danh mục con.
- **Ngôn ngữ**: **mã** (ví dụ `vn`, `en`) và tên. Mã chỉ đặt được lúc tạo, sau
  đó không sửa. Đây là mã mà mọi bản dịch tham chiếu tới.

## B5. Bản dịch

Đây là nơi làm cho cửa hàng thật sự song ngữ.

1. Chọn tab: **Thương hiệu**, **Danh mục** hoặc **Sản phẩm**.
2. **Tạo** → chọn đối tượng cần dịch → chọn **ngôn ngữ** → nhập **tên** và
   **mô tả** trong ngôn ngữ đó → *Lưu*.

Khách xem `/vi` sẽ thấy bản dịch `vn`; thiếu thì hệ thống rơi về `en`; thiếu nữa
thì hiện tên gốc. Nên không dịch cũng không vỡ giao diện, chỉ là hiện tên gốc.

## B6. Xử lý đơn hàng

Trang **Đơn hàng**:

- Lọc theo trạng thái ở góc phải trên, tìm theo từ khóa ở ô tìm kiếm.
- Bấm **mã đơn** (dãy chữ xanh) để mở danh sách món trong đơn.
- Đổi trạng thái bằng ô chọn ở cột cuối. **Đổi là áp dụng ngay, không hỏi lại.**

Quy trình thường: *Chờ xác nhận* → *Chờ lấy hàng* → *Chờ giao hàng* → *Đã giao*.
Đơn hủy thì chọn *Đã hủy*; khách trả lại thì chọn *Đã trả hàng*.

## B7. Người dùng, vai trò, quyền

**Người dùng** — tạo tài khoản thay khách (email + mật khẩu), gán **vai trò**,
đặt **trạng thái** `ACTIVE` / `INACTIVE` / `BLOCKED`. Khi sửa: email không đổi
được, và **để trống ô mật khẩu nghĩa là giữ nguyên mật khẩu cũ**.

**Vai trò** — tên, mô tả, công tắc bật/tắt, và danh sách quyền để tick. Mỗi quyền
có dạng `tài nguyên:hành động:phạm vi`, ví dụ `product:create:any`. Vai trò hệ
thống không xóa được.

**Quyền** — chỉ để tra cứu: xem danh sách quyền và vai trò nào đang giữ. Muốn
thay đổi thì vào **Vai trò** và tick lại.

*Muốn cấp quyền quản trị cho một người?* Vào **Vai trò**, tạo/sửa một vai trò và
tick các quyền cần thiết, rồi vào **Người dùng** gán vai trò đó. Người dùng cần
đăng xuất và đăng nhập lại (hoặc đợi tối đa 60 giây) để giao diện nhận quyền mới.

## B8. Kho ảnh

Bốn ô tải lên, dùng ô nào cũng được — khác nhau ở số lượng file:

- **Một ảnh**: chọn 1 file PNG/JPEG.
- **Nhiều ảnh**: chọn nhiều file, tối đa 10.
- **Nhiều field**: 1 file ở `file1` và tối đa 3 file ở `file3`, rồi bấm gửi.
- **Presigned URL**: nhập `key` và `type` để lấy link tải lên trực tiếp; bên dưới
  có ô xóa object theo `key`.

Tải xong, các ảnh hiện ở lưới cuối trang; bấm **Sao chép** để lấy URL dán vào
form sản phẩm hoặc thương hiệu.

> Lưới này chỉ nhớ **các ảnh vừa tải trong phiên làm việc** (tối đa 24) — tải lại
> trang là mất. Hãy sao chép URL ra chỗ khác trước khi rời trang.
