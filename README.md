# BuildAwcean Backend API

[![Node.js](https://img.shields.io/badge/Node.js-22.x-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/license/isc-license-txt)
[![Last Commit](https://img.shields.io/github/last-commit/<your-username>/buildawcean-backend)](https://github.com/<your-username>/buildawcean-backend/commits/main)

A Node.js + Express backend for an e-commerce-style app, backed by SQLite through Sequelize.

This API serves products, cart operations, delivery options, orders, users, image assets, and a database reset utility for local development.

## Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- Available Scripts
- API Base URL
- API Endpoints
- Demo
- Request/Response Examples
- Data Seeding and Reset Behavior
- Error Handling
- Notes and Limitations
- Future Improvements
- License

## Overview

BuildAwcean Backend is designed to support a shopping flow:

1. Fetch product catalog and delivery options.
2. Add/update/remove cart items.
3. View payment summary.
4. Create orders from persisted cart items.

The application uses SQLite for easy local setup and auto-seeds default records on first boot.

## Features

- RESTful JSON API using Express.
- SQLite persistence via Sequelize ORM.
- Automatic database sync on startup.
- Automatic first-run seeding of default products, delivery options, cart items, and orders.
- Cart operations:
    - add item,
    - update quantity or delivery option,
    - replace whole cart,
    - delete item,
    - optional cart expansion with full product data.
- Payment summary calculation (items, shipping, subtotal, tax, total).
- Order creation from current cart in a single transaction.
- Optional response expansion for:
    - orders with product details,
    - cart with product details,
    - delivery options with computed delivery timestamp.
- Static image serving via /images.
- One-click reset endpoint to wipe and re-seed DB for development.

## Tech Stack

- Runtime: Node.js
- Server: Express 5
- Database: SQLite
- ORM: Sequelize
- Logging: Morgan
- CORS: cors
- Config: dotenv
- Dev Tooling: nodemon, ESLint

## Project Structure

```text
buildawcean-backend/
    src/
        app.js                 # Express app and middleware
        routes/                # Route modules
        controllers/           # Route handlers and business logic
        models/                # Sequelize models and DB connection
        middleware/            # Error handler
    defaultData/             # First-run / reset seed data
    images/                  # Static assets served at /images
    server.js                # App entrypoint and startup seeding logic
    database.db              # SQLite DB file (generated at runtime)
```

## Getting Started

### 1) Clone repository

```bash
git clone https://github.com/<your-username>/buildawcean-backend.git
cd buildawcean-backend
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment file

Create a .env file in the project root:

```env
PORT=5000
```

### 4) Run in development

```bash
npm run dev
```

### 5) Run in production mode

```bash
npm start
```

Server default URL:

```text
http://localhost:5000
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| PORT | No | 5000 | Port used by the Express server |

## Available Scripts

- npm start: Runs the server with Node.
- npm run dev: Runs the server with nodemon for auto-reload.
- npm run lint: Lints the project using ESLint.

## API Base URL

```text
http://localhost:5000
```

API routes are under:

```text
/api
```

## API Endpoints

### Health

- GET /: Health/welcome message.
- GET /api: API route guide message.

### Users

- GET /api/users: List all users.
- POST /api/users: Create a user.

### Products

- GET /api/products: List all products.
- POST /api/products: Create a product.

### Delivery Options

- GET /api/delivery-options: List delivery options.
    - Optional query: ?expand=estimatedDeliveryTime
- POST /api/delivery-options: Create a delivery option.

### Cart

- GET /api/cart-items: List cart items.
    - Optional query: ?expand=product or ?expand=products
- POST /api/cart-items: Add a cart item.
    - If product already exists in cart, quantity is incremented.
- PUT /api/cart-items: Replace entire cart with submitted array.
- PUT /api/cart-items/:productId: Update quantity and/or deliveryOptionId.
- DELETE /api/cart-items/:productId: Remove item from cart.

Alias route:

- /api/cart-item maps to the same cart handlers.

### Payment Summary

- GET /api/payment-summary: Returns totals for current cart:
    - totalItems
    - productsCostCents
    - shippingCostCents
    - totalBeforeTaxCents
    - taxCents
    - totalCostCents

### Orders

- GET /api/orders: List orders sorted newest first.
    - Optional query: ?expand=products
- GET /api/orders/:orderId: Get order by id.
    - Optional query: ?expand=products
- POST /api/orders: Create order from persisted cart, then clear cart.

### Reset (Development Utility)

- POST /api/reset: Truncates all model tables and re-seeds default data.

### Images

- Static file serving: GET /images/<path-to-file>
- Image listing endpoint: GET /images

## Demo

Use the API collection below to quickly test the backend with Postman.

- Postman collection (repo file): [docs/BuildAwcean.postman_collection.json](docs/BuildAwcean.postman_collection.json)

Quick steps:

1. Start the server with npm run dev.
2. In Postman, import [docs/BuildAwcean.postman_collection.json](docs/BuildAwcean.postman_collection.json).
3. Set baseUrl to http://localhost:5000 if needed.
4. Run requests in this order for a full flow: Get Products -> Add Cart Item -> Get Payment Summary -> Create Order.

## Request/Response Examples

### Add Cart Item

Request:

```http
POST /api/cart-items
Content-Type: application/json

{
    "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    "quantity": 2
}
```

Response (201 or 200):

```json
{
    "success": true,
    "data": {
        "cart": [],
        "newCart": [
            {
                "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
                "quantity": 2,
                "deliveryOptionId": "1"
            }
        ],
        "cartItem": {
            "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
            "quantity": 2,
            "deliveryOptionId": "1"
        }
    }
}
```

### Replace Entire Cart

Request:

```http
PUT /api/cart-items
Content-Type: application/json

[
    {
        "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
        "quantity": 1,
        "deliveryOptionId": "1"
    },
    {
        "productId": "15b6fc6f-327a-4ec4-896f-486349e85a3d",
        "quantity": 3,
        "deliveryOptionId": "2"
    }
]
```

### Create Order

Request:

```http
POST /api/orders
```

Response (201):

```json
{
    "success": true,
    "data": {
        "id": "1b5f77f3-1c63-456d-a77d-53f77f6d3f7d",
        "orderTimeMs": 1710000000000,
        "totalCostCents": 4096,
        "products": [
            {
                "productId": "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
                "quantity": 1,
                "estimatedDeliveryTimeMs": 1710172800000
            }
        ]
    }
}
```

## Data Seeding and Reset Behavior

- On startup, the app runs sequelize.sync().
- If products table is empty, default seed data is inserted for:
    - products,
    - delivery options,
    - cart,
    - orders.
- POST /api/reset can be used to clear and re-seed data at any time during development.

## Error Handling

- Standard error middleware returns:

```json
{
    "success": false,
    "message": "..."
}
```

- Common error cases:
    - invalid payload shape,
    - missing required fields,
    - invalid productId or deliveryOptionId references,
    - operations on non-existent cart item or order.

## Notes and Limitations

- No authentication/authorization is currently implemented.
- Input validation is currently controller-level and partial.
- Image listing endpoint reads only top-level files in images directory.
- This project is currently optimized for local development with SQLite.

## Future Improvements

- Add OpenAPI/Swagger docs.
- Add automated tests (unit + integration).
- Add request validation middleware (for example, Joi/Zod).
- Add auth (JWT/session).
- Add pagination/filtering for product and order endpoints.
- Add CI pipeline (lint + test).

## License

ISC
