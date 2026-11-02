# Lịch Sự Kiện – by Đức Anh Hoàng

Web app tĩnh (HTML/CSS/JS thuần, không cần build) quản lý sự kiện theo **ngày âm hoặc dương**, nhắc trước 7 ngày và 3 ngày. Giao diện kiểu iOS 26 (kính mờ), hỗ trợ iPhone, iPad, PC và cài như ứng dụng (PWA).

## Tính năng
- Lịch tháng dương kèm ngày âm; danh sách "Sự kiện tháng này" theo tháng đang xem
- Sự kiện chọn **âm lịch hoặc dương lịch**, **hằng năm** hoặc **một lần** (một lần hết hạn thì ngừng nhắc)
- Khu "Nhắc lịch": đang diễn ra, nhắc lần 1 (còn 4–7 ngày), nhắc lần 2 (còn 1–3 ngày)
- Thời tiết bằng chữ (nắng, âm u, mưa…), dự báo sáng/chiều/tối và 7 ngày (Open-Meteo)
- Hiển thị tên nơi người xem đang đứng (theo vị trí thiết bị)
- **Ghi chú địa điểm** (tên + ghi chú, có ô tìm kiếm, không nhắc lịch); thêm/sửa/xoá cần mật khẩu
- Thêm/sửa/xoá sự kiện sau khi nhập mật khẩu (nhập một lần, mở khoá 5 phút)

## Chạy thử
```bash
npm run dev      # mở http://localhost:3000
```

## Cập nhật lên GitHub
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```
Vercel tự deploy lại sau mỗi lần push lên `main`.

## Phông chữ SVN-Avo
Đặt file phông vào `public/assets/fonts/` đúng tên: `SVN-Avo.woff2` (hoặc `.ttf`) và `SVN-Avo-Bold.woff2` (hoặc `.ttf`). Chưa có thì app dùng phông tròn của hệ thống. Chỉ dùng phông bạn có bản quyền sử dụng.

## Đổi mật khẩu
Sửa hằng `PASS` ở đầu `public/js/app.js`. Đây là kiểm tra phía trình duyệt, ai xem mã nguồn của trang đều đọc được.

## Lưu ý dữ liệu
Sự kiện lưu trong `localStorage` của từng thiết bị (không đồng bộ giữa các máy). Sự kiện cũ tự được chuyển sang định dạng mới.
