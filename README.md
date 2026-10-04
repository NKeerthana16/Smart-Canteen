# Smart Canteen Pre-Order & Queue Management System

A full-stack web application built to streamline canteen pre-ordering, food menu management, pickup time slot scheduling, and queue capacity control.

---

## Architecture Overview

```text
                  SMART CANTEEN
                       |
        --------------------------------
        |                              |
 AngularJS Frontend              Admin Interface
        |                              |
        ----------- HTTP Requests ------
                       |
                 Express.js API
                       |
                  Node.js Server
                       |
                   Mongoose
                       |
                    MongoDB
```

---

## Technologies Used

- **Frontend**:
  - HTML5 & CSS3
  - JavaScript
  - AngularJS 1.8.2
  - AngularJS ngRoute
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB & Mongoose
  - JSON Web Tokens (JWT) for Auth

---

## Project Structure

```text
smart-canteen/
│
├── API_DOCUMENTATION.md
├── README.md
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── controllers.js
│   │   ├── data.js
│   │   └── services.js
│   └── views/
│       ├── admin-categories.html
│       ├── admin-dashboard.html
│       ├── admin-feedback.html
│       ├── admin-food.html
│       ├── admin-orders.html
│       ├── admin-reports.html
│       ├── admin-slots.html
│       ├── admin-users.html
│       ├── cart.html
│       ├── checkout.html
│       ├── feedback.html
│       ├── food-details.html
│       ├── home.html
│       ├── login.html
│       ├── menu.html
│       ├── my-orders.html
│       ├── order-success.html
│       ├── order-tracking.html
│       ├── profile.html
│       ├── register.html
│       └── student-dashboard.html
│
└── backend/
    ├── server.js
    ├── seed.js
    ├── package.json
    ├── .env
    ├── .gitignore
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Food.js
    │   ├── Category.js
    │   ├── PickupSlot.js
    │   ├── Order.js
    │   └── Feedback.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── foodRoutes.js
    │   ├── categoryRoutes.js
    │   ├── slotRoutes.js
    │   ├── orderRoutes.js
    │   ├── feedbackRoutes.js
    │   └── adminRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── foodController.js
    │   ├── categoryController.js
    │   ├── slotController.js
    │   ├── orderController.js
    │   ├── feedbackController.js
    │   └── adminController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    └── utils/
        └── generateToken.js
```

---

## Setup & Running Instructions

### 1. Backend Setup

Navigate to the `backend` folder:

```bash
cd backend
npm install
```

#### Seed Initial Data:

Populate default admin, student accounts, categories, foods, and pickup slots:

```bash
npm run seed
```

#### Run Backend Server:

```bash
npm run dev
```
or
```bash
npm start
```

The Express backend will start at: `http://localhost:5000`

---

### 2. Frontend Setup

The frontend uses standard AngularJS 1.8.2 and static web assets.

Simply open `frontend/index.html` in any web browser, or serve the `frontend/` directory using standard web servers (VS Code Live Server, http-server, python http.server, etc.).

Example using Python:
```bash
cd frontend
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

---

## Demo Login Credentials

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: Admin

### Student Account
- **Email**: `student@gmail.com`
- **Password**: `123456`
- **Role**: Student

---

## Core Features

1. **Student Registration & Login**: JWT-authenticated student accounts.
2. **Menu Browsing & Search**: Search food items by name and filter by categories.
3. **Queue Capacity Management**: Pickup slots dynamically enforce maximum capacity. Atomic MongoDB updates prevent overbooking.
4. **Pre-Order Placement**: Server calculates total prices and validates inventory before generating unique order numbers (`ORD-XXXX`).
5. **Real-Time Status Tracking**: Student tracks status (`Placed` -> `Accepted` -> `Preparing` -> `Ready for Pickup` -> `Completed`).
6. **Admin Dashboard & Management**: Admins manage food menu items, categories, pickup slots, order statuses, user activation, and view live analytics & reports.
