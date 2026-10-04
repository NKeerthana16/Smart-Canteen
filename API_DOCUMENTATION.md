# Smart Canteen REST API Documentation

**Base URL**: `http://localhost:5000/api`

---

## Authentication & Headers

Protected routes require the HTTP `Authorization` header containing a valid JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Student Name",
  "email": "student@gmail.com",
  "phone": "9876543210",
  "password": "123456"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "660123456789abcdef012345",
    "name": "Student Name",
    "email": "student@gmail.com",
    "phone": "9876543210",
    "role": "student",
    "status": "active"
  }
}
```

### Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@gmail.com",
  "password": "123456"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "660123456789abcdef012345",
    "name": "Student Name",
    "email": "student@gmail.com",
    "phone": "9876543210",
    "role": "student",
    "status": "active"
  }
}
```

---

## 2. Food Management Endpoints

### Get All Foods
- **Method**: `GET`
- **Endpoint**: `/api/foods`
- **Params**: `?search=dosa&category=Breakfast&available=true`
- **Access**: Public

### Get Food Details
- **Method**: `GET`
- **Endpoint**: `/api/foods/:id`
- **Access**: Public

### Create Food Item
- **Method**: `POST`
- **Endpoint**: `/api/foods`
- **Access**: Private (Admin)
- **Request Body**:
```json
{
  "name": "Paneer Butter Masala",
  "category": "Lunch",
  "price": 120,
  "description": "Rich paneer gravy served hot.",
  "image": "https://example.com/image.jpg",
  "available": true
}
```

### Update Food Item
- **Method**: `PUT`
- **Endpoint**: `/api/foods/:id`
- **Access**: Private (Admin)

### Delete Food Item
- **Method**: `DELETE`
- **Endpoint**: `/api/foods/:id`
- **Access**: Private (Admin)

---

## 3. Category Endpoints

### Get Categories
- **Method**: `GET`
- **Endpoint**: `/api/categories`
- **Access**: Public

### Create Category
- **Method**: `POST`
- **Endpoint**: `/api/categories`
- **Access**: Private (Admin)

### Delete Category
- **Method**: `DELETE`
- **Endpoint**: `/api/categories/:id`
- **Access**: Private (Admin)

---

## 4. Pickup Slot & Capacity Endpoints

### Get All Pickup Slots
- **Method**: `GET`
- **Endpoint**: `/api/slots`
- **Access**: Public
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "660123456789abcdef012346",
      "id": "660123456789abcdef012346",
      "time": "12:00 PM - 12:30 PM",
      "maxCapacity": 10,
      "bookedCount": 9,
      "remaining": 1,
      "status": "Available",
      "active": true
    }
  ]
}
```

### Create Pickup Slot
- **Method**: `POST`
- **Endpoint**: `/api/slots`
- **Access**: Private (Admin)

### Update / Delete Pickup Slot
- **Method**: `PUT / DELETE`
- **Endpoint**: `/api/slots/:id`
- **Access**: Private (Admin)

---

## 5. Order & Queue Capacity Endpoints

### Place Order (With Atomic Queue Booking & Server Total Calculation)
- **Method**: `POST`
- **Endpoint**: `/api/orders`
- **Access**: Private (Student/Admin)
- **Request Body**:
```json
{
  "items": [
    { "id": "660123456789abcdef012347", "name": "Dosa", "price": 50, "quantity": 2 }
  ],
  "pickupDate": "2026-09-29",
  "pickupSlot": "12:00 PM - 12:30 PM",
  "paymentMethod": "Counter Cash / UPI",
  "notes": "Less oil please"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "ORD-4829",
    "userEmail": "student@gmail.com",
    "totalAmount": 100,
    "pickupSlot": "12:00 PM - 12:30 PM",
    "status": "Placed"
  }
}
```
*Note: If the selected pickup slot is FULL (`bookedCount >= maxCapacity`), the request is atomically rejected with status `400 Bad Request`.*

### Get Orders
- **Method**: `GET`
- **Endpoint**: `/api/orders`
- **Access**: Private (Student gets own orders; Admin gets all orders)

### Get Order Details
- **Method**: `GET`
- **Endpoint**: `/api/orders/:id`
- **Access**: Private

### Update Order Status
- **Method**: `PUT`
- **Endpoint**: `/api/orders/:id/status`
- **Access**: Private (Admin)
- **Request Body**:
```json
{
  "status": "Ready for Pickup"
}
```
*Allowed Statuses*: `Placed`, `Accepted`, `Preparing`, `Ready for Pickup`, `Completed`, `Cancelled`.

---

## 6. Feedback Endpoints

### Submit Feedback
- **Method**: `POST`
- **Endpoint**: `/api/feedback`
- **Access**: Private

### Get Feedback List
- **Method**: `GET`
- **Endpoint**: `/api/feedback`
- **Access**: Private

---

## 7. User Profile & Admin Endpoints

### Get / Update Profile
- **Method**: `GET / PUT`
- **Endpoint**: `/api/users/profile`
- **Access**: Private

### Get Users List & Toggle Status
- **Method**: `GET / PUT`
- **Endpoint**: `/api/users` & `/api/users/:id/status`
- **Access**: Private (Admin)

### Admin Dashboard & Reports
- **Method**: `GET`
- **Endpoint**: `/api/admin/dashboard` & `/api/admin/reports`
- **Access**: Private (Admin)
