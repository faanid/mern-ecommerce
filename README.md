# MERN E-commerce

[![CI](https://github.com/faanid/mern-ecommerce/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/faanid/mern-ecommerce/actions/workflows/ci.yml)

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js.

## Features

- Public product catalogue and product detail pages
- Shopping cart persisted in browser local storage
- User registration, login, logout, and profile updates
- JWT authentication using HTTP-only cookies
- Admin-protected product and user management APIs
- Shipping address management and order placement
- Order history and order details
- Server-side order pricing based on current product prices
- Admin order management with manual offline payment confirmation
- Delivery status updates restricted to paid orders

## Important Limitations

- No online payment gateway is integrated. Administrators can manually confirm offline payments. Orders remain unpaid until an administrator confirms payment.
- Inventory availability is checked when an order is created, but stock is not reserved or decremented. Concurrent orders may exceed available stock.
- Admin product CRUD and user-management APIs are available. Admins can also manage payment and delivery status from order details, but dedicated admin dashboard screens are not implemented.
- Production deployment and security configuration still require additional validation. This project is not presented as production-ready.

## Tech Stack

- **Frontend:** React 18, React Router 6, Redux Toolkit / RTK Query, React Bootstrap
- **Backend:** Node.js, Express 4, Mongoose
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens in HTTP-only cookies
- **CI:** GitHub Actions

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

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   npm install --prefix frontend
   ```

4. Create a root `.env` file based on `.env.example`. Configure a valid MongoDB URI and a long, random JWT secret.

5. Start both applications:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

The React development server proxies `/api` requests to the backend. For production, configure the frontend and API behind the same site, or deliberately configure CORS and cookie settings when using separate origins.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend and frontend in development |
| `npm start` | Start the backend |
| `npm run server` | Start the backend with nodemon |
| `npm run client` | Start the frontend |
| `npm test` | Run backend automated tests |
| `npm run data:import` | Clear and seed the database with sample data |
| `npm run data:destroy` | Delete seeded users, products, and orders |

**Warning:** Both seeder commands can delete existing documents from the `users`, `products`, and `orders` collections. Use them only with a disposable development database.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | No | Set to `production` in production |

Never commit your real `.env` file or production secrets.

## API Overview

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
| PUT | `/orders/:id/pay` | Admin |
| PUT | `/orders/:id/deliver` | Admin |

The backend recalculates item prices, tax, shipping, and order totals using product records from the database rather than trusting prices submitted by the browser.

An order must be marked as paid before an administrator can mark it as delivered.

## Continuous Integration

GitHub Actions runs the following checks on pushes to `main` and pull requests targeting `main`:

- Install backend and frontend dependencies
- Run backend automated tests
- Check backend JavaScript syntax
- Build the frontend

See the [CI workflow](https://github.com/faanid/mern-ecommerce/actions/workflows/ci.yml) for details.

## Project Structure

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

## Development Status

The core account, catalogue, cart, and order workflows are implemented. Backend automated tests and a GitHub Actions CI workflow are also in place.

Payment gateway integration, inventory reservation, dedicated admin dashboard screens, deployment, and further production security validation remain outside the current scope.
