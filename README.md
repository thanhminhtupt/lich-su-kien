# Lịch Sự Kiện – by Đức Anh Hoàng

Web app quản lý sự kiện theo **ngày âm hoặc dương**, nhắc trước 7 ngày và 3 ngày, ghi chú địa điểm, ngày lễ, thời tiết theo vị trí. Giao diện phẳng, hỗ trợ iPhone, iPad, PC và cài như ứng dụng (PWA).

## Dữ liệu dùng chung (khuyến nghị)
Thêm/sửa/xoá sự kiện và địa điểm được lưu trên máy chủ (Vercel Function `api/store.js` + Upstash Redis), mọi người mở trang đều thấy dữ liệu mới nhất (tự đồng bộ mỗi 30 giây và khi mở lại trang). Mật khẩu được kiểm tra **trên máy chủ**.

Cài đặt trên Vercel:
1. Project → **Storage** (hoặc Marketplace) → thêm **Upstash Redis** (gói Free) → Connect to Project. Vercel tự thêm biến `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
2. Project → **Settings → Environment Variables** → thêm `ADMIN_PASSWORD` = mật khẩu của bạn (tick cả Production/Preview/Development).
3. **Deployments → Redeploy** để biến môi trường có hiệu lực.

Chưa cấu hình thì app chạy chế độ cục bộ: dữ liệu lưu trên từng thiết bị và dùng mật khẩu `PASS` đầu file `public/js/app.js`.

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
