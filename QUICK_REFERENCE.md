# Book Management System - Quick Reference

## 📁 Files Created

```
✅ config/multerConfig.js          - File upload configuration
✅ middleware/authMiddleware.js    - Role-based authorization
✅ controller/bookController.js    - Business logic (6 functions)
✅ routes/books.js                 - API endpoints (6 routes)
✅ API_DOCUMENTATION.md            - Complete API reference
✅ IMPLEMENTATION_GUIDE.md         - Architecture and best practices
✅ Updated: app.js                 - Integrated book routes
✅ Updated: package.json           - Added multer dependency
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Test Endpoints
See **API Endpoints** section below

---

## 📌 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/books` | Public | Get all books (paginated, searchable) |
| GET | `/api/v1/books/:id` | Public | Get single book by ID |
| POST | `/api/v1/books` | Admin | Create new book |
| PUT | `/api/v1/books/:id` | Admin | Update book |
| DELETE | `/api/v1/books/:id` | Admin | Delete book |
| POST | `/api/v1/books/:bookId/upload-cover` | Admin | Upload book cover image |

---

## 🔐 Authorization

### Public Routes (GET)
No authentication required

### Protected Routes (POST, PUT, DELETE, Upload)
Add these headers:
```
x-user-role: admin
x-user-id: any-user-id
```

---

## 📋 Controller Functions

### `getAllBooks(req, res)`
- **Query params:** `page`, `limit`, `search`
- **Returns:** Books array with pagination metadata
- **Example:** `/books?page=1&limit=10&search=javascript`

### `getBookById(req, res)`
- **Params:** `:id`
- **Returns:** Single book with populated relations
- **Example:** `/books/507f1f77bcf86cd799439011`

### `createBook(req, res)`
- **Required fields:** isbn, title, publisher_id, category_id
- **Optional fields:** published_year, quantity, available_copies
- **Validation:** ISBN unique, publisher exists, category exists
- **Returns:** Created book with ID

### `updateBook(req, res)`
- **Params:** `:id`
- **Body:** Any book fields to update
- **Validation:** ISBN unique check, foreign key validation
- **Returns:** Updated book

### `deleteBook(req, res)`
- **Params:** `:id`
- **Returns:** Deleted book document
- **Validation:** Book must exist

### `uploadBookCover(req, res)`
- **Params:** `:bookId`
- **File:** Form field named `cover`
- **Types:** JPEG, PNG, GIF, WebP
- **Max size:** 5MB
- **Returns:** Upload metadata with file path

---

## 🗂️ Database Schemas Used

### Book Schema
```javascript
{
  isbn: String (unique, required),
  title: String (required),
  publisher_id: ObjectId (ref: publisher, required),
  category_id: ObjectId (ref: category, required),
  published_year: Number,
  quantity: Number,
  available_copies: Number
}
```

### Upload Schema
```javascript
{
  file_name: String,
  file_path: String,
  uploaded_at: Date
}
```

### Publisher Schema (linked)
```javascript
{
  name: String,
  address: String,
  phone: String
}
```

### Category Schema (linked)
```javascript
{
  name: String,
  description: String
}
```

---

## 💡 Code Examples

### Create a Book
```javascript
POST /api/v1/books
Headers: {
  "Content-Type": "application/json",
  "x-user-role": "admin"
}
Body: {
  "isbn": "978-1449355739",
  "title": "Learning JavaScript",
  "publisher_id": "507f1f77bcf86cd799439012",
  "category_id": "507f1f77bcf86cd799439013",
  "quantity": 50,
  "available_copies": 45
}

Response: {
  "success": true,
  "message": "Book created successfully",
  "data": { book object with ID }
}
```

### Search Books
```javascript
GET /api/v1/books?search=javascript&page=1&limit=10

Response: {
  "success": true,
  "data": {
    "books": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "total": 25,
      "limit": 10
    }
  }
}
```

### Upload Cover Image
```javascript
POST /api/v1/books/507f1f77bcf86cd799439011/upload-cover
Headers: {
  "x-user-role": "admin"
}
File: cover.jpg (form-data)

Response: {
  "success": true,
  "data": {
    "upload_id": "...",
    "file_path": "/uploads/cover-1704067200000.jpg",
    "uploaded_at": "2024-01-01T12:00:00Z"
  }
}
```

---

## ⚠️ Error Handling

All errors return JSON format:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Common Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad request (validation error)
- **403** - Forbidden (not admin)
- **404** - Not found
- **409** - Conflict (ISBN duplicate)
- **413** - File too large
- **500** - Server error

---

## 🔍 File Location Reference

| File | Purpose |
|------|---------|
| `config/multerConfig.js` | Multer settings, storage location, file validation |
| `middleware/authMiddleware.js` | Check admin role from headers |
| `controller/bookController.js` | All CRUD logic, search, pagination, upload |
| `routes/books.js` | Define 6 endpoints, link to controller |
| `app.js` | Register book routes at `/api/v1/books` |
| `package.json` | Added multer dependency |
| `public/uploads/` | Uploaded book covers stored here |

---

## 🎯 Architecture Flow

```
CLIENT REQUEST
    ↓
app.js (routes registered)
    ↓
routes/books.js (matches path & method)
    ↓
middleware/authMiddleware.js (verifies admin for protected routes)
    ↓
config/multerConfig.js (handles file upload if needed)
    ↓
controller/bookController.js (executes business logic)
    ↓
schemas/ (Book, Publisher, Category, Upload models)
    ↓
MongoDB
    ↓
JSON RESPONSE
```

---

## ✅ Validation Rules

### ISBN
- Required
- Must be unique
- String format
- Example: `978-1449355739`

### Title
- Required
- String format
- Any length OK

### Publisher ID & Category ID
- Required
- Valid MongoDB ObjectId
- Must exist in database

### Published Year
- Optional
- Number format
- Defaults to current year

### Quantity & Available Copies
- Optional
- Number format
- Default: 0

### File Upload
- File type: JPEG, PNG, GIF, WebP only
- Max size: 5MB
- Form field: `cover`
- Stored: `/public/uploads/`

---

## 🧪 Testing Checklist

- [ ] Test GET all books (public)
- [ ] Test GET book by ID (public)
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test CREATE book (admin required)
- [ ] Test CREATE book (without admin - should fail 403)
- [ ] Test CREATE duplicate ISBN (should fail 409)
- [ ] Test UPDATE book
- [ ] Test DELETE book
- [ ] Test upload cover image
- [ ] Test upload with invalid file type
- [ ] Test upload with file > 5MB
- [ ] Test all error responses
- [ ] Verify uploaded files in `/public/uploads/`

---

## 🛠️ Debugging Tips

1. **Check headers** for admin role:
   ```
   x-user-role: admin
   ```

2. **Check file path** for multer:
   - Uploads go to: `/public/uploads/`
   - Create `/public/` if it doesn't exist

3. **Check MongoDB connection**:
   - Ensure MongoDB is running
   - Check connection string in app.js

4. **Check console logs**:
   - Controller logs errors for debugging
   - Run with `npm start` to see nodemon output

5. **Verify ObjectIds**:
   - Use valid MongoDB ObjectIds for publisher_id, category_id
   - Copy from database or API response

---

## 📞 Support

For detailed API documentation, see: `API_DOCUMENTATION.md`
For architecture details, see: `IMPLEMENTATION_GUIDE.md`
