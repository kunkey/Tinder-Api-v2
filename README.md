# 🚀 Tinder Tool - Siêu Công Cụ Quản Lý & Tự Động Hóa Tinder

![Tinder Tool Banner](https://user-images.githubusercontent.com/your-banner.png)

## Giới thiệu
**Tinder Tool** là ứng dụng web mạnh mẽ giúp bạn quản lý, nhắn tin, tự động hóa và tối ưu trải nghiệm Tinder trên máy tính. Giao diện hiện đại, dễ dùng, nhiều tính năng thông minh giúp bạn tiết kiệm thời gian và tăng hiệu quả kết nối.

---

## 🌟 Tính năng nổi bật
- **Xem danh sách match, tin nhắn đã nhắn, tin nhắn chưa trả lời**
- **Gửi tin nhắn nhanh, tự động gửi tin nhắn hàng loạt**
- **Hiển thị ảnh đại diện, xem toàn bộ album ảnh của đối phương**
- **Phân biệt ai là người nhắn cuối, thông báo tin nhắn mới bằng dấu chấm đỏ**
- **Nút "Xem thêm" để tải thêm tin nhắn, nút "Cập nhật" để làm mới thủ công**
- **Tùy chỉnh cấu hình, vị trí, thông tin xác thực dễ dàng**
- **Giao diện responsive, đẹp mắt, hỗ trợ cả desktop và mobile**

---

## 🖼️ Hình ảnh minh họa
| Quản lý tin nhắn | Xem album ảnh | Thông báo tin nhắn mới |
|------------------|--------------|------------------------|
| ![chat](https://user-images.githubusercontent.com/your-chat-demo.png) | ![album](https://user-images.githubusercontent.com/your-album-demo.png) | ![noti](https://user-images.githubusercontent.com/your-noti-demo.png) |

---

## ⚡ Hướng dẫn cài đặt
### 1. Clone dự án
```bash
git clone https://github.com/your-username/tinder-tool.git
cd tinder-tool
```
### 2. Cài đặt dependencies
```bash
npm install
```
### 3. Cấu hình
- Điền thông tin xác thực Tinder vào file `config/auth.json` (xem hướng dẫn chi tiết trong app).
- Tùy chỉnh các thiết lập trong `config/setting.json` nếu muốn.
- Tạo file `.env` để cấu hình cổng (PORT) nếu muốn:

```env
PORT=8080
```

### 4. Chạy ứng dụng
```bash
npm start
```
- Truy cập: [http://localhost:3000](http://localhost:3000) (hoặc cổng bạn đã cấu hình)

### 5. Chạy bằng Docker (khuyên dùng cho production)
```bash
docker build -t tinder-tool .
docker run -d --env-file .env -p 8080:8080 tinder-tool
```
- Truy cập: [http://localhost:8080](http://localhost:8080)

---

## 💡 Mẹo sử dụng
- Click vào **ảnh đại diện** để xem toàn bộ album ảnh của đối phương.
- Dấu chấm đỏ cạnh tên là **người kia vừa nhắn tin cho bạn**.
- Sử dụng nút **Cập nhật** để làm mới danh sách tin nhắn thủ công.
- Dùng nút **Xem thêm** để tải thêm các cuộc trò chuyện cũ hơn.

---

## 🛠️ Công nghệ sử dụng
- Node.js, Express, EJS, Socket.IO
- HTML5, CSS3, JavaScript hiện đại
- Tinder API (reverse engineered)

---

## 📣 Đóng góp & Liên hệ
- Đóng góp ý tưởng, báo lỗi hoặc PR tại [GitHub Issues](https://github.com/your-username/tinder-tool/issues)
- Liên hệ tác giả: [your-email@example.com]

---

## ❤️ Credit
- Dành tặng cho cộng đồng dev Việt Nam yêu thích tự động hóa!
- **Tinder Tool** không liên kết với Tinder Inc. Sử dụng với mục đích cá nhân, vui lòng tuân thủ điều khoản của Tinder.

---

> "Tinder Tool - Kết nối thông minh, trải nghiệm tuyệt vời!" 