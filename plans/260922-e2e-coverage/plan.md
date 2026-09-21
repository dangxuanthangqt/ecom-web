# E2E cho ecom-web

Status: done · 2026-09-22 · Playwright 1.63 + axe-core

## Quyết định nền
| Hạng mục | Chốt | Lý do |
|---|---|---|
| Backend khi test | Mock API riêng (`e2e/mock-api/`) | Nest local không phục vụ được phiên đăng nhập: DB rỗng, `RESEND_API_KEY` trống, `ADMIN_PASSWORD` 5 ký tự < ràng buộc 8–20 của login DTO |
| Độ trung thực của mock | Bám `swagger.yaml`: envelope list, envelope lỗi + `details[]`, bearer, refresh, ma trận quyền | Test phải đỏ khi contract lệch, không phải khi mock lệch |
| Chạy với API thật | `E2E_API_URL` + `E2E_BASE_URL` | Cùng bộ spec, chỉ đổi nguồn dữ liệu |
| Định vị field | `#id` thay vì `getByLabel` | Label mang dấu `*` (aria-hidden) nên text thô không khớp; việc label gắn đúng input được kiểm riêng trong `a11y.spec.ts` |
| Song song | `workers: 1` | Mock có state dùng chung, reset trước mỗi test |

## Kết quả
141 test / 15 file, 3 lần chạy lạnh liên tiếp đều xanh (~1 phút 20 mỗi lần).
`tsc --noEmit` và `eslint` sạch. CI: `.github/workflows/e2e.yml`.

## Bug do E2E tìm ra (đã sửa)
| # | Bug | Ảnh hưởng |
|---|---|---|
| 1 | `DropdownMenuLabel` thiếu `Menu.Group` bọc ngoài → Base UI throw | **Menu user crash với mọi tài khoản đã đăng nhập** |
| 2 | `media:upload:own` nằm trong nhóm quyền mở admin | Mọi shopper vào được `/admin` |
| 3 | Nhãn sidebar `t("media")` trỏ vào object message, không phải chuỗi | Mục "Tệp media" không render |
| 4 | Tiêu đề trang media cũng `tAdmin("media")` | Cùng lỗi trên tiêu đề |
| 5 | Filter danh mục gate bằng "đã đăng nhập" thay vì quyền | Shopper bắn request `/categories` chắc chắn 403 |
| 6 | `aria-label` đè tên hiển thị ở user menu, locale switcher, cart badge | Vi phạm WCAG 2.5.3, voice control không bấm được |
| 7 | `text-primary` (#059669) làm màu chữ trên nền sáng: 3.8:1 | Rớt WCAG 1.4.3 AA — thêm token `--link` #047857 (5.5:1) |
| 8 | Chip trạng thái dùng chính màu nền làm màu chữ | Rớt contrast — thêm bộ token `*-strong` |
| 9 | Nút phụ trong hero chứa cả câu + `whitespace-nowrap` | Tràn ngang 30px ở 375px |
| 10 | Sửa giá trong admin không bust cache ISR của trang chủ | Giá cũ hiển thị tới 60 giây — thêm `/api/revalidate` theo tag |
| 11 | Panel 2FA chỉ toast lỗi, không gắn lỗi vào field | Lệch với phần còn lại của app |
| 12 | Alt của thumbnail lặp lại tên sản phẩm ngay bên cạnh | Screen reader đọc hai lần; cũng gây strict-mode ambiguity |

## Chưa phủ
- Thanh toán thật (API chưa có cổng thanh toán).
- Upload file lên S3 thật — mock trả URL giả, không kiểm chứng multipart tới S3.
- Chạy với Nest thật: cần `pnpm db:seed`, `ADMIN_PASSWORD` ≥ 8 ký tự, `RESEND_API_KEY` thật.
- Chỉ Chromium + Pixel 7. Thêm WebKit/Firefox là đổi một dòng `projects`.
