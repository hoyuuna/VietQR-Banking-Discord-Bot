# Bot Discord hỗ trợ chuyển khoản qua VietQR (HoyuPay)

Dự án mã nguồn mở bởi Hoyuuna, người dùng chịu toàn bộ trách nhiệm khi sử dụng

Mã nguồn có thể được chỉnh sửa cho mục đích cá nhân/thương mại mà không cần xin phép/credit

## Bot này khác gì các bot khác?

- HoyuPay hỗ trợ người bán hàng trên Discord có thể cho mệnh giá, điền thông tin sẵn cho khách hàng
- Hỗ trợ mọi ngân hàng được liên kết với VietQR (hiện tại mới test với VCB, MB)
- Người dùng tự host, đảm bảo hiệu suất và bảo mật
- Setup .env dễ dàng
- Cho phép nhập UID, GID để cho phép những server/người dùng nào được sử dụng

## Hướng dẫn sử dụng

1. Download/clone repository này hoặc để Git Repo Address (nếu dùng DV host bên thứ 3)
2. Chỉnh sửa file `env.example`, làm theo hướng dẫn trong file và lưu lại, đổi tên thành `.env`
3. Chạy bot với NodeJS 23 (khuyến cáo), file startup là `index.js`
4. Nếu host không thể tự động nhận các packages cần thiết hãy chạy lệnh `npm install dotenv crc qrcode discord.js`
5. Sử dụng `h!pay [giá tiền] [nội dung (không bắt buộc)]` để bắt đầu sử dụng

## Update

### Các tính năng trong tương lai (dự tính)

- Kiểm tra trạng thái chuyển khoản
- Nhắc hẹn chu kì thanh toán
- Ngoài ra chưa nghĩ ra thêm gì :)

### 1.0 (hiện tại)

- Phiên bản đầu tiên của HoyuPay
