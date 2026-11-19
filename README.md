# MERN E-commerce

A MERN-stack e-commerce application built with MongoDB, Express, React, and Node.js.

## Features

- Public product catalogue and product detail pages
- Shopping cart persisted in browser local storage
- User registration, login, logout, and profile updates
- JWT authentication stored in an HTTP-only cookie
- Admin-protected product and user management APIs
- Shipping address, order placement, order history, and order details
- Server-side order pricing based on current product prices

## Important limitations

- Online payment processing is not integrated. Orders currently use a clearly labelled manual/offline payment method and remain unpaid until a payment workflow is implemented.
- Inventory is checked when an order is created, but stock is not reserved or decremented because payment confirmation and cancellation flows are not implemented yet.
- Admin product CRUD and user-management APIs are available, but dedicated admin dashboard screens are not yet implemented.
- This project is still under development and has not yet been certified as production-ready.

## Tech stack

- **Frontend:** React 18, React Router 6, Redux Toolkit / RTK Query, React Bootstrap
- **Backend:** Node.js, Express 4, Mongoose
- **Authentication:** JSON Web Tokens in HTTP-only cookies

## Requirements

- Node.js 18 or newer
- npm
- MongoDB (local or hosted)

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/faanid/mern-ecommerce.git
   cd mern-ecommerce
   ```

2. Install root/backend dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   npm install --prefix frontend
   ```

4. Create a root `.env` file from `.env.example`. Set a real MongoDB URI and a long, random JWT secret.

5. Start both applications:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

The React development server proxies `/api` requests to the backend. In production, configure the frontend and API behind the same site (or configure CORS and cookie settings deliberately before using separate origins).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend and frontend in development |
| `npm start` | Start the backend |
| `npm run server` | Start the backend with nodemon |
| `npm run client` | Start the frontend |
| `npm run data:import` | Clear and seed the database with sample data |
| `npm run data:destroy` | Delete seeded users, products, and orders |

**Warning:** Both Seeder commands delete existing documents from the `users`, `products`, and `orders` collections. Use them only with a disposable development database.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long, random secret used to sign JWTs |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | No | Use `production` in production |

Never commit your real `.env` file or production secrets.

## API overview

All endpoints are prefixed with `/api`.

### Users

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/users` | Public registration |
| POST | `/users/login` | Public login |
| POST | `/users/logout` | Public logout |
| GET | `/users/profile` | Authenticated |
| PUT | `/users/profile` | Authenticated |
| GET | `/users` | Admin |
| GET | `/users/:id` | Admin |
| PUT | `/users/:id` | Admin |
| DELETE | `/users/:id` | Admin |

### Products

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| POST | `/products` | Admin |
| PUT | `/products/:id` | Admin |
| DELETE | `/products/:id` | Admin |

### Orders

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/orders` | Authenticated |
| GET | `/orders/myorders` | Authenticated |
| GET | `/orders/:id` | Owner or Admin |
| GET | `/orders` | Admin |
| PUT | `/orders/:id/deliver` | Admin |

The backend recalculates item prices, tax, shipping, and totals from database product records; it does not trust prices submitted by the browser.

## Project structure

```text
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── modules/
│   ├── routes/
│   └── server.js
├── frontend/
│   └── src/
├── .env.example
├── package.json
└── README.md
```

## Development status

The core account, catalogue, cart, and order flows are being implemented and reviewed. Automated integration tests, payment integration, inventory reservation, admin UI, deployment configuration, and production security hardening remain outstanding.
