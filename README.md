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
  "role_name": "admin" | "thủ thư" | "người dùng"
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

## 8. Thông báo (Notifications)

### Lấy thông báo cá nhân
**GET** `/api/notifications`

### Đánh dấu đã đọc
**PUT** `/api/notifications/:id/read`
