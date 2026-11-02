# Lịch Sự Kiện – Âm Dương

Web app tĩnh (HTML/CSS/JS thuần, không cần build) để lưu sự kiện theo **ngày âm lịch** và nhắc lại hằng năm (trước 7 ngày và 3 ngày). Hỗ trợ iPhone, iPad, PC và cài như ứng dụng (PWA).

## Tính năng
- Lịch tháng dương kèm ngày âm, khoanh tròn hôm nay, tô vàng nhạt ngày có sự kiện
- Thời tiết hiện tại và dự báo 7 ngày (Open-Meteo)
- Thêm/sửa/xoá sự kiện sau khi nhập mật khẩu; sự kiện tự rơi đúng ngày mỗi năm
- Thông báo trong trang và thông báo trình duyệt
- PWA: cài lên màn hình chính, chạy offline phần giao diện

## Chạy thử
```bash
npm run dev      # mở http://localhost:3000
```

## Đưa lên GitHub
```bash
git init
git add .
git commit -m "Khởi tạo Lịch Sự Kiện"
git branch -M main
git remote add origin https://github.com/<tai-khoan>/lich-su-kien.git
git push -u origin main
```

## Triển khai Vercel
1. Vào [vercel.com/new](https://vercel.com/new), chọn **Import Git Repository** và chọn repo vừa tạo.
2. Framework Preset: **Other**. Không cần Build Command; `vercel.json` đã đặt thư mục xuất là `public`.
3. Bấm **Deploy**. Mỗi lần `git push` lên `main` Vercel tự cập nhật.

## Đổi mật khẩu
Sửa hằng `PASS` ở đầu `public/js/app.js`. Lưu ý: đây là kiểm tra phía trình duyệt, chỉ ngăn người dùng thông thường.

## Lưu ý dữ liệu
Sự kiện lưu trong `localStorage` của từng thiết bị (không đồng bộ giữa các máy). Muốn đồng bộ cần thêm backend (ví dụ Vercel KV/Supabase).
