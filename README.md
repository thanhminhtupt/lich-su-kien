# Lịch Sự Kiện – by Đức Anh Hoàng (bản 2.2)

**Hướng dẫn đưa lên Vercel từng bước: xem `HUONG-DAN-VERCEL.md`.**

Web app quản lý sự kiện theo **ngày âm hoặc dương**, ghi chú địa điểm, tài khoản thành viên, duyệt bài và **thông báo đẩy** có **số trên icon app**. Giao diện phẳng kiểu iOS, tự đổi sáng/tối, cài như ứng dụng (PWA).

## Có gì mới trong bản 2.0
- **Tài khoản**: đăng ký (tên + email + mật khẩu), đăng nhập, đăng xuất, đổi tên, đổi mật khẩu, **quên mật khẩu** (gửi liên kết đặt lại vào đúng email đã đăng ký, hiệu lực 30 phút).
- **Phiên làm việc 20 phút**: không thao tác 20 phút thì tự đăng xuất. Đồng hồ đếm ngược nằm cạnh nút Đăng xuất.
- **Ngày diễn ra**: chọn **Vào ngày** hoặc **Từ ngày đến ngày** (được kéo sang tháng sau, sang năm sau, ví dụ 25/12 → 5/1). Dương lịch chọn bằng lịch; âm lịch chọn ngày + tháng âm. Đổi Âm ↔ Dương tự quy đổi ngày.
- **Duyệt bài**: thành viên gửi lịch / địa điểm → chờ duyệt, chưa hiển thị. Quản trị viên và người gửi đều nhận thông báo; khi duyệt / từ chối người gửi được báo (kèm lý do).
- **Trùng tên địa điểm**: gõ tên là app hiện ngay địa điểm trùng (chặn lưu) hoặc tương tự (cảnh báo), có nút **Xem** và **Góp ý vào đây**.
- **Góp ý**: thành viên gửi góp ý (nội dung + vị trí mới) vào địa điểm đã có. Góp ý đính kèm ngay dưới địa điểm cho quản trị viên; bấm **Đưa vào địa điểm** để sửa & lưu, người góp ý được báo.
- **Quyền**: quản trị viên sửa / xoá mọi địa điểm và sự kiện. Thành viên chỉ **thêm** và **sửa nội dung do mình tạo**, **không xoá** được gì. Muốn xoá thì bấm **Yêu cầu xoá** → quản trị viên nhận thông báo, bấm Xoá hoặc Giữ lại → người yêu cầu được báo kết quả.
- Thành viên **góp ý** được vào mọi địa điểm của quản trị viên hoặc thành viên khác (nút 💬 Góp ý ngay trên dòng địa điểm).
- Trang **Cần duyệt** (`/#duyet`): yêu cầu xoá, lịch/địa điểm chờ duyệt, góp ý.
- **Chuông thông báo** = sự kiện trong 7 ngày tới + thông báo chưa đọc. **Số trên icon app** luôn bằng số ở chuông.
- **Thông báo đẩy**: mỗi sáng 7:00 – 8:00 (nếu có việc), và ngay khi có bài cần duyệt / được duyệt / góp ý. Có nút **Bật**, **Gửi thử**, **Tắt** và danh sách thiết bị.
- **Tạo Icon Màn Hình** nằm trong mục QR: Android/Chrome/Edge bấm 1 lần là máy hỏi Cài đặt; iPhone hiện 4 bước có hình minh hoạ. Có thanh gợi ý tự hiện (tối đa 1 lần / 7 ngày).
- **Đếm lượt truy cập** ở cuối trang: hôm nay, tuần này, tháng này, toàn thời gian (mỗi máy tính 1 lượt / ngày, giờ Việt Nam).
- Icon mới, mật khẩu không còn nằm trong mã nguồn trình duyệt.

## Cài đặt trên Vercel (Settings → Environment Variables)
| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Có | Upstash Redis (đã có từ trước) |
| `ADMIN_PASSWORD` | Có | Mật khẩu ban đầu của tài khoản `admin` (đổi trong app thì mật khẩu mới thay thế) |
| `ADMIN_EMAIL` | Không bắt buộc | Mặc định ducanhitpt@gmail.com: đăng nhập admin bằng email này + ADMIN_PASSWORD, dùng được Quên mật khẩu |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Cho thông báo đẩy | Tạo 1 lần: `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | Nên có | `mailto:email-cua-ban@gmail.com` |
| `CRON_SECRET` | Cho nhắc buổi sáng | Chuỗi ngẫu nhiên bất kỳ (Vercel Cron tự gửi kèm) |
| `RESEND_API_KEY` + `MAIL_FROM` | Cho quên mật khẩu (cách 1) | Tài khoản Resend miễn phí |
| `SMTP_USER`, `SMTP_PASS` (+ `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM`) | Cho quên mật khẩu (cách 2) | Gmail: SMTP_USER = gmail, SMTP_PASS = **Mật khẩu ứng dụng** 16 ký tự |
| `APP_URL` | Nên có | `https://lich-su-kien.vercel.app` (dùng cho liên kết trong email) |

Sau khi thêm biến: **Deployments → Redeploy**. Lịch nhắc buổi sáng đã khai báo trong `vercel.json` (`0 0 * * *` = 7h sáng giờ Việt Nam).

Đăng nhập quản trị: tên đăng nhập `admin` (hoặc ADMIN_EMAIL) + mật khẩu ADMIN_PASSWORD.

## Lưu ý thông báo & số trên icon
- **iPhone/iPad** (iOS 16.4+): phải **thêm app ra màn hình chính** rồi mở từ icon mới bật được thông báo và số trên icon (Apple chỉ cho phép như vậy).
- **Android**: Chrome hỗ trợ thông báo; số trên icon tuỳ launcher (Samsung, Pixel hiện dấu chấm hoặc số).
- **Máy tính**: Chrome/Edge (app đã cài) hiện số trên icon ở thanh tác vụ/Dock.

## Chạy thử trên máy
```bash
npm install
npm run dev      # http://localhost:3000 – dữ liệu trong bộ nhớ, admin / admin123
```
Ở chế độ thử, Quên mật khẩu hiện thẳng liên kết đặt lại trên màn hình thay vì gửi email.

## Cấu trúc
- `public/` – giao diện (index.html, js/app.js, css/styles.css, sw.js, assets/)
- `api/store.js` – sự kiện, địa điểm, góp ý, duyệt bài, đếm truy cập
- `api/auth.js` – tài khoản, phiên 20 phút, quên/đổi mật khẩu, thông báo trong app
- `api/push.js` – bật/tắt/gửi thử thông báo đẩy, danh sách thiết bị
- `api/cron.js` – nhắc buổi sáng (Vercel Cron)
- `api/_*.js` – thư viện dùng chung (không phải API)

## Cập nhật lên GitHub
```bash
git add .
git commit -m "Lịch Sự Kiện 2.0"
git push
```
Vercel tự deploy lại sau mỗi lần push lên `main`.
