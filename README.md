# Lịch Sự Kiện – by Đức Anh Hoàng

Web app quản lý sự kiện theo **ngày âm hoặc dương**, nhắc trước 7 ngày và 3 ngày, ghi chú địa điểm, ngày lễ, thời tiết theo vị trí. Giao diện phẳng, hỗ trợ iPhone, iPad, PC và cài như ứng dụng (PWA).

## Tính năng chính
- Mục **Sắp tới** hiện 10 sự kiện gần nhất; nút cam **Tất cả các sự kiện** mở trang quản lý (tìm kiếm, sửa, xoá, sao lưu).
- Lặp lại: **hằng năm**, **2 năm / lần**, **một lần**; ngày âm hoặc dương.
- Công tắc thông báo BẬT (xanh) / TẮT (xám); nút **Đóng góp sự kiện** chuyển sang Zalo.
- Dòng **Lưu trữ %** cạnh nút Thêm sự kiện, kèm cảnh báo khi Vercel/Upstash báo lỗi hoặc gần hết hạn mức.
- Mã QR chia sẻ: `public/assets/qr.svg` (tạo cho địa chỉ https://lich-su-kien.vercel.app/; đổi tên miền thì cần tạo lại mã QR).

- Địa điểm gồm tên, nhiều vị trí (tên + link + ghi chú), ghi chú; chỉ hiện phần có nội dung. Không cho trùng tên (sự kiện và địa điểm).
- Nút **Tạo Icon Màn Hình** ở cuối trang hướng dẫn / kích hoạt thêm icon ra màn hình điện thoại.

- Chuông thông báo hiện số sự kiện trong 7 ngày tới; nếu đã thêm app ra màn hình, số này hiện trên icon (khi thiết bị hỗ trợ).
- Nút **Thêm lời nhắc (Lịch)** trong chi tiết sự kiện: tạo file .ics có nhắc trước 3 ngày, trước 1 ngày (8h sáng) và trước giờ diễn ra 1 tiếng (không có giờ: nhắc lúc 5h sáng) (Android có thêm nút Google Calendar).

- Sự kiện có thể thêm nhiều **địa điểm** (tên + link Google); hiện dạng "Tên - Đường Đi" phía trên ghi chú, không thêm thì không hiện. (Địa điểm của sự kiện)

## Dữ liệu dùng chung (khuyến nghị)
Thêm/sửa/xoá sự kiện và địa điểm được lưu trên máy chủ (Vercel Function `api/store.js` + Upstash Redis), mọi người mở trang đều thấy dữ liệu mới nhất (tự đồng bộ mỗi 60 giây khi đang mở trang và khi mở lại trang). Mật khẩu được kiểm tra **trên máy chủ**.

Cài đặt trên Vercel:
1. Project → **Storage** (hoặc Marketplace) → thêm **Upstash Redis** (gói Free) → Connect to Project. Vercel tự thêm biến `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
2. Project → **Settings → Environment Variables** → thêm `ADMIN_PASSWORD` = mật khẩu của bạn (tick cả Production/Preview/Development).
3. **Deployments → Redeploy** để biến môi trường có hiệu lực.

Sự kiện hằng năm và địa điểm luôn được giữ. Sự kiện một lần tự xoá sau khi đã kết thúc 30 ngày (máy chủ làm khi có người mở trang).

Chưa cấu hình thì app chạy chế độ cục bộ: dữ liệu lưu trên từng thiết bị và dùng mật khẩu `PASS` đầu file `public/js/app.js`.

## Thời tiết
Trang không còn tải dữ liệu thời tiết. Thay vào đó có một liên kết **Thời tiết hôm nay** mở kết quả Google (tab mới), không cần API hay khoá.

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
