# LibrarySystem

## API Documentation

### Authentication

#### Register
POST /api/auth/register
```json
{
  "username": "string",
  "password": "string",
  "full_name": "string",
  "email": "string",
  "role_name": "admin" | "thủ thư" | "người dùng"
}
```

#### Login
POST /api/auth/login
```json
{
  "username": "string",
  "password": "string"
}
```
Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "string",
    "full_name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### User Management (Admin only)

All endpoints require Authorization header: `Bearer <token>`

#### Get all users
GET /api/users

#### Get user by ID
GET /api/users/:id

#### Create user
POST /api/users
```json
{
  "username": "string",
  "password": "string",
  "full_name": "string",
  "email": "string",
  "role_name": "admin" | "thủ thư" | "người dùng"
}
```

#### Update user
PUT /api/users/:id
```json
{
  "username": "string",
  "full_name": "string",
  "email": "string",
  "role_name": "admin" | "thủ thư" | "người dùng"
}
```

#### Delete user
DELETE /api/users/:id

### Roles
- admin: Full access to user management
- thủ thư: Librarian
- người dùng: Regular user