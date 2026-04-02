# Book Management System - API Documentation

## Overview
Complete Book Management system with CRUD operations, file upload, and role-based authorization.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## Getting Started

### Installation
```bash
# Install dependencies
npm install

# Start server (with nodemon)
npm start

# Server runs on: http://localhost:3000
```

### Directory Structure
```
project/
├── config/
│   └── multerConfig.js        # File upload configuration
├── controller/
│   └── bookController.js      # Business logic
├── middleware/
│   └── authMiddleware.js      # Authentication/authorization
├── routes/
│   └── books.js               # Route definitions
├── schemas/
│   ├── Book.js
│   ├── Publisher.js
│   ├── Category.js
│   └── Upload.js
└── public/
    └── uploads/               # Uploaded files storage
```

---

## Authentication

### Authorization Header
For protected endpoints (Create, Update, Delete), pass user role:

```
x-user-role: admin
x-user-id: user-123
```

**Note:** In production, replace with JWT token authentication.

### Required Roles
- **GET** (Read): Public - no authentication required
- **POST** (Create): Admin role required
- **PUT** (Update): Admin role required
- **DELETE** (Delete): Admin role required
- **POST** (Upload): Admin role required

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1/books
```

### 1. Get All Books (Public)

**Endpoint:**
```
GET /api/v1/books
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Items per page |
| search | string | "" | Search books by title (case-insensitive) |

**Example:**
```
GET /api/v1/books?page=1&limit=10&search=programming
```

**Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": {
    "books": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "isbn": "978-1449355739",
        "title": "Learning JavaScript",
        "publisher_id": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "O'Reilly Media",
          "address": "Sebastopol, CA",
          "phone": "978-0596006747"
        },
        "category_id": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Programming",
          "description": "Programming languages and development"
        },
        "published_year": 2011,
        "quantity": 50,
        "available_copies": 45
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

---

### 2. Get Book by ID (Public)

**Endpoint:**
```
GET /api/v1/books/:id
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Book MongoDB ObjectId |

**Example:**
```
GET /api/v1/books/507f1f77bcf86cd799439011
```

**Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isbn": "978-1449355739",
    "title": "Learning JavaScript",
    "publisher_id": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "O'Reilly Media",
      "address": "Sebastopol, CA",
      "phone": "978-0596006747"
    },
    "category_id": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Programming",
      "description": "Programming languages and development"
    },
    "published_year": 2011,
    "quantity": 50,
    "available_copies": 45
  }
}
```

**Error Response:** ❌ 404 Not Found
```json
{
  "success": false,
  "message": "Book not found",
  "data": null
}
```

---

### 3. Create Book (Admin Only)

**Endpoint:**
```
POST /api/v1/books
```

**Headers:**
```
Content-Type: application/json
x-user-role: admin
x-user-id: user-123
```

**Request Body:**
```json
{
  "isbn": "978-1449355739",
  "title": "Learning JavaScript",
  "publisher_id": "507f1f77bcf86cd799439012",
  "category_id": "507f1f77bcf86cd799439013",
  "published_year": 2011,
  "quantity": 50,
  "available_copies": 45
}
```

**Required Fields:**
- `isbn` (unique)
- `title`
- `publisher_id`
- `category_id`

**Optional Fields:**
- `published_year` (defaults to current year)
- `quantity` (defaults to 0)
- `available_copies` (defaults to 0)

**Response:** ✅ 201 Created
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isbn": "978-1449355739",
    "title": "Learning JavaScript",
    "publisher_id": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "O'Reilly Media",
      "address": "Sebastopol, CA",
      "phone": "978-0596006747"
    },
    "category_id": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Programming",
      "description": "Programming languages and development"
    },
    "published_year": 2011,
    "quantity": 50,
    "available_copies": 45
  }
}
```

**Error Response:** ❌ 409 Conflict (ISBN exists)
```json
{
  "success": false,
  "message": "Book with this ISBN already exists",
  "data": null
}
```

---

### 4. Update Book (Admin Only)

**Endpoint:**
```
PUT /api/v1/books/:id
```

**Headers:**
```
Content-Type: application/json
x-user-role: admin
x-user-id: user-123
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Book MongoDB ObjectId |

**Request Body:** (Any fields can be updated)
```json
{
  "title": "Advanced JavaScript",
  "published_year": 2015,
  "available_copies": 40
}
```

**Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isbn": "978-1449355739",
    "title": "Advanced JavaScript",
    "publisher_id": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "O'Reilly Media"
    },
    "category_id": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Programming"
    },
    "published_year": 2015,
    "quantity": 50,
    "available_copies": 40
  }
}
```

---

### 5. Delete Book (Admin Only)

**Endpoint:**
```
DELETE /api/v1/books/:id
```

**Headers:**
```
x-user-role: admin
x-user-id: user-123
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Book MongoDB ObjectId |

**Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isbn": "978-1449355739",
    "title": "Learning JavaScript",
    "quantity": 50,
    "available_copies": 45
  }
}
```

**Error Response:** ❌ 404 Not Found
```json
{
  "success": false,
  "message": "Book not found",
  "data": null
}
```

---

### 6. Upload Book Cover (Admin Only)

**Endpoint:**
```
POST /api/v1/books/:bookId/upload-cover
```

**Headers:**
```
x-user-role: admin
x-user-id: user-123
(multipart/form-data - automatically set by form)
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| bookId | string | Book MongoDB ObjectId |

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| cover | file | Image file (jpeg, png, gif, webp, max 5MB) |

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/v1/books/507f1f77bcf86cd799439011/upload-cover \
  -H "x-user-role: admin" \
  -H "x-user-id: user-123" \
  -F "cover=@/path/to/cover.jpg"
```

**Response:** ✅ 200 OK
```json
{
  "success": true,
  "message": "Book cover uploaded successfully",
  "data": {
    "upload_id": "507f1f77bcf86cd799439014",
    "file_name": "cover-1704067200000-123456789.jpg",
    "file_path": "/uploads/cover-1704067200000-123456789.jpg",
    "uploaded_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response:** ❌ 400 Bad Request (Invalid file type)
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, png, gif, webp)",
  "data": null
}
```

**Error Response:** ❌ 413 Payload Too Large
```json
{
  "success": false,
  "message": "File is too large (max 5MB)",
  "data": null
}
```

---

## Request/Response Examples

### Example 1: Create a Book
**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -H "x-user-id: user-123" \
  -d '{
    "isbn": "978-1491954324",
    "title": "You Don'\''t Know JS",
    "publisher_id": "507f1f77bcf86cd799439012",
    "category_id": "507f1f77bcf86cd799439013",
    "published_year": 2015,
    "quantity": 30,
    "available_copies": 28
  }'
```

### Example 2: Search Books
**cURL:**
```bash
curl "http://localhost:3000/api/v1/books?page=1&limit=5&search=javascript"
```

### Example 3: Update Book
**cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/books/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -H "x-user-id: user-123" \
  -d '{
    "available_copies": 20,
    "quantity": 35
  }'
```

### Example 4: Delete Book
**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/books/507f1f77bcf86cd799439011 \
  -H "x-user-role: admin" \
  -H "x-user-id: user-123"
```

---

## Error Handling

### Error Response Format
All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": "Optional error details"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successfully retrieved or updated resource |
| 201 | Created | Book created successfully |
| 400 | Bad Request | Missing required fields |
| 403 | Forbidden | User does not have admin role |
| 404 | Not Found | Book or related resource not found |
| 409 | Conflict | ISBN already exists |
| 413 | Payload Too Large | File exceeds 5MB limit |
| 500 | Server Error | Internal server error |

### Validation Rules

**ISBN:**
- Required
- Must be unique
- String format

**Title:**
- Required
- String format

**Publisher ID:**
- Required
- Must be valid MongoDB ObjectId
- Publisher must exist in database

**Category ID:**
- Required
- Must be valid MongoDB ObjectId
- Category must exist in database

**Published Year:**
- Optional
- Must be a number
- Defaults to current year if not provided

**Quantity & Available Copies:**
- Optional
- Must be numbers
- Default to 0 if not provided

**File Upload:**
- Allowed types: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Stored in `/public/uploads`
- File info saved in Upload collection

---

## Notes for Production

### Security Improvements Needed
1. Replace mock authentication with JWT tokens
2. Implement proper password hashing
3. Add rate limiting
4. Implement CORS policy
5. Add request validation library (joi, express-validator)
6. Use environment variables for sensitive data

### File Management
- Implement file deletion when book is deleted
- Add backup strategy for uploaded files
- Consider cloud storage (AWS S3, Azure Blob, etc.)

### Database
- Add database indexes for better performance
- Implement transaction handling for complex operations
- Add regular backups

### Future Enhancements
- Add book reviews and ratings
- Implement book recommendations
- Add advanced filtering and sorting
- Integrate with external APIs (ISBN lookup, etc.)
- Add analytics and reporting

---

## Support
For questions or issues, contact the development team.
