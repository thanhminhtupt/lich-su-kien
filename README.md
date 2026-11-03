# Lịch Sự Kiện – by Đức Anh Hoàng

Web app quản lý sự kiện theo **ngày âm hoặc dương**, nhắc trước 7 ngày và 3 ngày, ghi chú địa điểm, ngày lễ, thời tiết theo vị trí. Giao diện phẳng, hỗ trợ iPhone, iPad, PC và cài như ứng dụng (PWA).

## Tính năng chính
- Mục **Sắp tới** hiện 10 sự kiện gần nhất; nút cam **Tất cả các sự kiện** mở trang quản lý (tìm kiếm, sửa, xoá, sao lưu).
- Lặp lại: **hằng năm**, **2 năm / lần**, **một lần**; ngày âm hoặc dương.
- Nút thông báo hiện rõ BẬT (xanh) / TẮT (xám); nút **Đóng góp sự kiện** chuyển sang Zalo.
- Dòng **Lưu trữ %** cạnh nút Thêm sự kiện, kèm cảnh báo khi Vercel/Upstash báo lỗi hoặc gần hết hạn mức.
- Mã QR chia sẻ: `public/assets/qr.svg` (tạo cho địa chỉ https://lich-su-kien.vercel.app/; đổi tên miền thì cần tạo lại mã QR).

## Dữ liệu dùng chung (khuyến nghị)
Thêm/sửa/xoá sự kiện và địa điểm được lưu trên máy chủ (Vercel Function `api/store.js` + Upstash Redis), mọi người mở trang đều thấy dữ liệu mới nhất (tự đồng bộ mỗi 60 giây khi đang mở trang và khi mở lại trang). Mật khẩu được kiểm tra **trên máy chủ**.

Cài đặt trên Vercel:
1. Project → **Storage** (hoặc Marketplace) → thêm **Upstash Redis** (gói Free) → Connect to Project. Vercel tự thêm biến `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
2. Project → **Settings → Environment Variables** → thêm `ADMIN_PASSWORD` = mật khẩu của bạn (tick cả Production/Preview/Development).
3. **Deployments → Redeploy** để biến môi trường có hiệu lực.

Sự kiện hằng năm và địa điểm luôn được giữ. Sự kiện một lần tự xoá sau khi đã kết thúc 30 ngày (máy chủ làm khi có người mở trang).

Chưa cấu hình thì app chạy chế độ cục bộ: dữ liệu lưu trên từng thiết bị và dùng mật khẩu `PASS` đầu file `public/js/app.js`.

## Thời tiết
Mặc định lấy từ Open-Meteo (miễn phí, không cần khoá). Nếu không tải được, trang tự thử **Google Weather** qua `api/weather.js`, rồi đến dữ liệu lần gần nhất đã lưu trên máy (hiện kèm giờ cập nhật).
Để bật Google Weather: tạo khoá API trong Google Cloud (bật **Weather API**), thêm biến môi trường `GOOGLE_WEATHER_API_KEY` trên Vercel rồi Redeploy. Kiểm tra giá và hạn mức hiện hành của Google trước khi dùng lâu dài.

## Phông chữ SVN-Avo
Đặt file vào `public/assets/fonts/`: `SVN-Avo.woff2` (hoặc `.ttf`) và `SVN-Avo-Bold.woff2` (hoặc `.ttf`). Chưa có thì dùng phông tròn của hệ thống.

## Chạy thử
```bash
npm run dev      # http://localhost:3000 (chế độ cục bộ, không có api)
```

## Cập nhật lên GitHub
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```
Vercel tự deploy lại sau mỗi lần push lên `main`.
