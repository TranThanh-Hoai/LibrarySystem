# LibrarySystem - API Documentation

Hệ thống quản lý thư viện (Library Management System) cung cấp các API để thực hiện các chức năng CRUD cho Sách, Tác giả, Thể loại, Nhà xuất bản, Người dùng và Quản lý mượn trả sách.

## 1. Xác thực (Authentication)

### Đăng ký tài khoản
**POST** `/api/auth/register`
- **Chức năng:** Tạo tài khoản người dùng mới.
- **Body JSON:**
```json
{
  "username": "string",
  "password": "string",
  "full_name": "string",
  "email": "string",
  "role_name": "admin" | "user"
}
```

### Đăng nhập
**POST** `/api/auth/login`
- **Chức năng:** Xác thực người dùng và nhận JWT token.
- **Body JSON:**
```json
{
  "username": "string",
  "password": "string"
}
```

---

## 2. Quản lý Người dùng (User Management)
*Yêu cầu quyền: **admin***

### Lấy danh sách người dùng
**GET** `/api/users`

### Lấy thông tin chi tiết người dùng
**GET** `/api/users/:id`

### Tạo người dùng mới
**POST** `/api/users`
- **Body JSON:** tương tự như phần đăng ký.

### Cập nhật thông tin người dùng
**PUT** `/api/users/:id`
- **Body JSON:**
```json
{
  "full_name": "string",
  "email": "string",
  "role_name": "admin" | "user"
}
```

### Xóa người dùng
**DELETE** `/api/users/:id`

---

## 3. Quản lý Sách (Book Management)

### Lấy tất cả sách (Có phân trang & Tìm kiếm)
**GET** `/api/books`
- **Query Params:** `page`, `limit`, `search` (theo tiêu đề).

### Lấy chi tiết sách
**GET** `/api/books/:id`

### Thêm sách mới (Admin only)
**POST** `/api/books`
- **Body JSON:**
```json
{
  "isbn": "string",
  "title": "string",
  "publisher_id": "object_id",
  "category_id": "object_id",
  "author_id": "object_id",
  "published_year": number,
  "quantity": number,
  "available_copies": number
}
```

### Cập nhật thông tin sách (Admin only)
**PUT** `/api/books/:id`

### Xóa sách (Admin only)
**DELETE** `/api/books/:id`

### Tải lên ảnh bìa (Admin only)
**POST** `/api/books/:bookId/cover`
- **Content-Type:** `multipart/form-data`
- **Field:** `cover` (file ảnh)

---

## 4. Quản lý Tác giả (Author Management)

### Danh sách tác giả
**GET** `/api/authors`

### Thêm tác giả (Admin only)
**POST** `/api/authors`
- **Body JSON:**
```json
{
  "name": "string",
  "bio": "string",
  "birth_date": "YYYY-MM-DD"
}
```

---

## 5. Quản lý Thể loại (Category Management)

### Danh sách thể loại
**GET** `/api/categories`

### Thêm thể loại (Admin only)
**POST** `/api/categories`
- **Body JSON:**
```json
{
  "name": "string",
  "description": "string"
}
```

---

## 6. Quản lý Nhà xuất bản (Publisher Management)

### Danh sách nhà xuất bản
**GET** `/api/publishers`

### Thêm nhà xuất bản (Admin only)
**POST** `/api/publishers`
- **Body JSON:**
```json
{
  "name": "string",
  "address": "string",
  "phone": "string"
}
```

---

## 7. Mượn trả Sách (Loan Management)

### Đăng ký mượn sách
**POST** `/api/loans/borrow`
- **Chức năng:** Tạo phiếu mượn cho người dùng hiện tại hoặc admin tạo cho người dùng khác.
- **Body JSON:**
```json
{
  "user_id": "object_id (optional for admin)",
  "due_date": "YYYY-MM-DD",
  "books": [
    { "book_id": "object_id", "condition": "New" }
  ]
}
```

### Trả sách
**POST** `/api/loans/return-book`
- **Chức năng:** Thực hiện trả một cuốn sách trong phiếu mượn, tính phí phạt nếu trễ hạn.
- **Body JSON:**
```json
{
  "loan_id": "object_id",
  "book_id": "object_id",
  "condition": "Good"
}
```

### Xem danh sách phiếu mượn
- **GET** `/api/loans`: Tất cả phiếu mượn (Yêu cầu admin).
- **GET** `/api/loans/my-loans`: Phiếu mượn cá nhân.

---

## 9. Các Chức năng Chính (Core Features)

- **Quản lý Thư viện Toàn diện:** CRUD cho Sách, Tác giả, Thể loại, Nhà xuất bản và Người dùng.
- **Hệ thống Mượn/Trả sách:** 
  - Quy trình mượn sách an toàn với kiểm soát số lượng tồn kho.
  - Tính năng trả sách linh hoạt, tự động tính toán phí phạt nếu trễ hạn.
- **Tìm kiếm & Phân trang:** Hỗ trợ tìm kiếm sách theo tiêu đề và phân trang dữ liệu API.
- **Thông báo Real-time:** Hệ thống thông báo tức thời cho người dùng về các sự kiện quan trọng.

---

## 10. Chi tiết Kỹ thuật (Technical Implementation)

### 🔐 Xác thực & Phân quyền (Authentication & Authorization)
- **JWT (JSON Web Token):** Sử dụng để bảo mật tất cả các API endpoint yêu cầu đăng nhập. Token được gửi qua header `Authorization: Bearer <token>`.
- **Role-based Access Control (RBAC):** Hệ thống phân quyền rõ ràng giữa `admin` (quyền tối cao, quản lý hệ thống) và `user` (đăng ký mượn/tra sách, xem thông báo).
- **Socket Authentication:** Kết nối WebSocket cũng được bảo vệ bằng middleware JWT, đảm bảo chỉ người dùng hợp lệ mới có thể nhận thông báo.

### 🔌 WebSocket (Real-time Notifications)
- **Công nghệ:** Sử dụng `Socket.io` để thiết lập kết nối song công (full-duplex).
- **Chức năng:** 
  - **Broadcast:** Thông báo cho tất cả người dùng khi có sách mới được thêm vào.
  - **Private:** Gửi thông báo riêng tư đến từng người dùng khi mượn sách thành công hoặc có phát sinh khoản phạt trễ hạn.
- **Phòng (Rooms):** Mỗi người dùng khi kết nối sẽ tự động tham gia vào một "phòng" riêng (dựa trên `userId`) để nhận thông báo cá nhân.

### 🛡️ Giao dịch (Transactions)
- **Mongoose Transactions:** Sử dụng trong tính năng **Mượn sách** (`borrowBook`). 
- **Đảm bảo:** Việc trừ số lượng sách khả dụng (`available_copies`) và tạo bản ghi phiếu mượn (`Loan`, `LoanDetail`) phải diễn ra đồng thời. Nếu một bước thất bại, toàn bộ quá trình sẽ được hoàn tác (rollback) để tránh sai lệch dữ liệu kho.

### 📂 Tải lên tệp (File Upload)
- **Công nghệ:** Sử dụng middleware `Multer` để xử lý tải lên hình ảnh.
- **Chức năng:** Admin có thể tải lên ảnh bìa cho sách. Tệp được lưu trữ cục bộ trong thư mục `/uploads/` và thông tin đường dẫn được lưu vào database để hiển thị trên giao diện.

---

## 11. Cấu trúc Thư mục Chính
- `/controller`: Xử lý logic nghiệp vụ.
- `/routes`: Định nghĩa các endpoint API.
- `/schemas`: Định nghĩa cấu trúc dữ liệu MongoDB (Mongoose).
- `/middleware`: Các bộ lọc xử lý (Auth, Upload).
- `/config`: Cấu hình hệ thống (Database, Socket.io).
- `/public`: Giao diện người dùng (HTML, CSS, JS).
- `/uploads`: Nơi lưu trữ ảnh bìa sách.
