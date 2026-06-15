# E-Commerce REST API

## Description

A lightweight e-commerce REST API built with JavaScript and Express. The API supports user registration, JWT-based authentication, and authenticated checkout with payment-method rules. All data is stored in memory — no database is required.

## Installation

1. Clone the repository and switch to the feature branch:

   ```bash
   git checkout feature/ecommerce-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## How to Run

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:3000`.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Rules

- **Authentication**: Only authenticated users (with a valid JWT token) can perform checkout.
- **Payment methods**: Checkout accepts only `cash` or `credit_card`.
- **Cash discount**: Paying with `cash` applies a **10% discount** on the order subtotal.
- **In-memory storage**: All users and products exist only in memory. Data resets when the server restarts.
- **Endpoints**: The API exposes exactly four endpoints — register, login, checkout, and healthcheck.

## Existent Data

### Users (pre-seeded)

| ID | Username | Email              | Password     |
|----|----------|--------------------|--------------|
| 1  | alice    | alice@example.com  | password123  |
| 2  | bob      | bob@example.com    | password456  |
| 3  | carol    | carol@example.com  | password789  |

### Products (pre-seeded)

| ID | Name                 | Price   | Stock |
|----|----------------------|---------|-------|
| 1  | Laptop               | $999.99 | 10    |
| 2  | Wireless Headphones  | $149.99 | 25    |
| 3  | Wireless Mouse       | $29.99  | 50    |

## How to Use the REST API

Base URL: `http://localhost:3000/api`

### 1. Healthcheck

Check if the API is running.

```http
GET /api/healthcheck
```

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-06-15T12:00:00.000Z"
}
```

### 2. Register

Create a new user account.

```http
POST /api/register
Content-Type: application/json

{
  "username": "dave",
  "email": "dave@example.com",
  "password": "mypassword"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 4,
    "username": "dave",
    "email": "dave@example.com"
  }
}
```

### 3. Login

Authenticate and receive a JWT token.

```http
POST /api/login
Content-Type: application/json

{
  "username": "alice",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

### 4. Checkout

Place an order (requires authentication).

```http
POST /api/checkout
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 3, "quantity": 2 }
  ],
  "paymentMethod": "cash"
}
```

**Response (200) — cash payment with 10% discount:**

```json
{
  "message": "Checkout completed successfully.",
  "order": {
    "items": [
      {
        "productId": 1,
        "name": "Laptop",
        "price": 999.99,
        "quantity": 1,
        "lineTotal": 999.99
      },
      {
        "productId": 3,
        "name": "Wireless Mouse",
        "price": 29.99,
        "quantity": 2,
        "lineTotal": 59.98
      }
    ],
    "paymentMethod": "cash",
    "subtotal": 1059.97,
    "discount": 106,
    "discountRate": 0.1,
    "total": 953.97
  }
}
```

**Payment methods:**

- `"cash"` — 10% discount applied to subtotal
- `"credit_card"` — no discount

### Error Responses

| Status | Scenario                                      |
|--------|-----------------------------------------------|
| 400    | Missing or invalid request data               |
| 401    | Missing, invalid, or expired JWT token          |
| 404    | Product not found                             |
| 409    | Username or email already registered          |
| 500    | Internal server error                         |

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Auth and error handling
├── models/          # In-memory data stores
├── routes/          # API route definitions
├── services/        # Business logic
└── app.js           # Express application setup
server.js              # Entry point
```
