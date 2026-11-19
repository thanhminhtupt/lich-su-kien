# Hướng dẫn đưa Lịch Sự Kiện 2.x lên Vercel

## Bước 1. Thay mã nguồn trên GitHub
1. Giải nén `lich-su-kien-v2.zip`, chép **toàn bộ** nội dung thư mục `lich-su-kien` đè lên thư mục dự án cũ (giữ thư mục `.git`).
2. Chạy:
   ```bash
   git add .
   git commit -m "Lịch Sự Kiện 2.x"
   git push
   ```
   (Hoặc dùng GitHub Desktop: Commit → Push.) Chưa cần chờ deploy, làm tiếp bước 2.

## Bước 2. Tạo khoá thông báo đẩy (VAPID) – làm 1 lần
Cách nhanh nhất (máy có Node.js): mở Terminal trong thư mục dự án, chạy
```bash
npx web-push generate-vapid-keys
```
Màn hình hiện 2 dòng: **Public Key** và **Private Key**. Giữ lại để dán vào bước 3.
Không cài được Node? Vào trang https://vapidkeys.com bấm Generate, cũng ra 2 khoá như trên.
⚠️ Không đổi khoá sau khi đã có người bật thông báo (đổi thì mọi máy phải bật lại).

## Bước 3. Thêm biến môi trường
Vercel → chọn dự án **lich-su-kien** → **Settings → Environment Variables**. Mỗi biến: điền Key, Value, tick cả **Production, Preview, Development**, bấm **Save**.

| Key | Value |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Đã có từ trước (Upstash). Không cần đụng. |
| `ADMIN_PASSWORD` | Đã có. Là mật khẩu đăng nhập tài khoản `admin`. |
| `ADMIN_EMAIL` | Không cần thêm: mặc định là `ducanhitpt@gmail.com`. Chỉ thêm nếu muốn đổi email admin. |
| `VAPID_PUBLIC_KEY` | Public Key ở bước 2 |
| `VAPID_PRIVATE_KEY` | Private Key ở bước 2 |
| `VAPID_SUBJECT` | `mailto:` + email của bạn, ví dụ `mailto:ducanh@gmail.com` |
| `CRON_SECRET` | Chuỗi ngẫu nhiên dài, ví dụ `lich-2026-x8Kq7vPz3mN` (tự đặt, không cần nhớ) |
| `APP_URL` | `https://lich-su-kien.vercel.app` |

### Gửi email Quên mật khẩu – chọn 1 trong 2 cách
**Cách A – Gmail (dễ nhất):**
1. Vào https://myaccount.google.com → **Bảo mật** → bật **Xác minh 2 bước** (nếu chưa bật).
2. Vào https://myaccount.google.com/apppasswords → đặt tên `Lich Su Kien` → **Tạo** → Google hiện mật khẩu 16 ký tự.
3. Thêm biến:
   - `SMTP_USER` = địa chỉ Gmail đó
   - `SMTP_PASS` = mật khẩu 16 ký tự (viết liền, bỏ dấu cách)

**Cách B – Resend:** đăng ký https://resend.com → API Keys → Create → thêm `RESEND_API_KEY` = khoá vừa tạo, `MAIL_FROM` = `Lịch Sự Kiện <onboarding@resend.dev>` (gói miễn phí chỉ gửi được tới email của chính bạn cho tới khi xác minh tên miền, nên Gmail tiện hơn).

## Bước 4. Deploy lại
**Deployments** → bấm `⋯` ở bản mới nhất → **Redeploy** (để biến mới có hiệu lực). Chờ trạng thái **Ready**.

## Bước 5. Kiểm tra
1. Mở https://lich-su-kien.vercel.app → **Đăng nhập** bằng `admin` + ADMIN_PASSWORD → bấm vào chữ cái đầu tên ở góc phải → **Đổi mật khẩu** nếu muốn.
2. Vercel → **Settings → Cron Jobs**: thấy `/api/cron` lịch `0 0 * * *` (7h sáng giờ VN) là đúng. Bấm **Run** để thử ngay.
3. Điện thoại: thêm app ra màn hình chính (nút Tạo Icon Màn Hình ở mục QR) → mở từ icon → **Bật thông báo trên máy này** → **Gửi thử thông báo**. Thấy thông báo và số trên icon là xong.
4. Đăng xuất → **Quên mật khẩu** → nhập ADMIN_EMAIL → kiểm tra hộp thư (cả Spam).

## Lỗi thường gặp
- *"Máy chủ chưa cấu hình khoá thông báo đẩy (VAPID)"*: thiếu `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` hoặc chưa Redeploy.
- *"Máy chủ chưa cấu hình gửi email"*: thiếu `SMTP_USER`/`SMTP_PASS` (hoặc `RESEND_API_KEY`).
- *"Không gửi được email"*: sai mật khẩu ứng dụng Gmail (phải là mật khẩu 16 ký tự, không phải mật khẩu Gmail).
- iPhone không có nút bật thông báo: phải mở app **từ icon màn hình chính**, iOS 16.4 trở lên.
- Gói Vercel miễn phí chỉ cho 1 lịch cron/ngày, đã đủ cho nhắc buổi sáng.
