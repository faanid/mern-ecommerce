# MERN E-commerce

A MERN-stack e-commerce application built with MongoDB, Express, React, and Node.js.

## Current functionality

- Browse the product catalogue
- View product details
- Add products to a shopping cart and update quantities
- Persist the cart in browser local storage
- Initial user authentication and product API foundations

> Note: checkout, order processing, payment integration, and several user-management endpoints are not implemented yet. They should not be considered production-ready features.

## Tech stack

- **Frontend:** React 18, React Router, Redux Toolkit / RTK Query, React Bootstrap
- **Backend:** Node.js, Express 4, Mongoose
- **Authentication foundation:** JSON Web Tokens stored in an HTTP-only cookie

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database (local or hosted)

## Setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/faanid/mern-ecommerce.git
   cd mern-ecommerce
   ```

2. Install backend/root dependencies:

   ```bash
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   npm install --prefix frontend
   ```

4. Create a root `.env` file based on `.env.example` and set your own MongoDB connection string and JWT secret.

5. Start the API and React development server:

   ```bash
   npm run dev
   ```

   - API: http://localhost:5000
   - Frontend: http://localhost:3000

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start backend and frontend in development |
| `npm start` | Start the backend |
| `npm run server` | Start the backend with nodemon |
| `npm run client` | Start the frontend |
| `npm run data:import` | Clear and seed the database with sample data |
| `npm run data:destroy` | Delete seeded users, products, and orders |

**Warning:** The data import and destroy scripts delete existing documents from the `users`, `products`, and `orders` collections. Use them only with a disposable development database.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | A long, random secret used to sign JWTs |
| `PORT` | No | API port (defaults to `5000`) |
| `NODE_ENV` | No | Set to `production` in production |

Never commit your real `.env` file or production secrets.

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
├── package.json
└── README.md
```

## Development status

This repository is under active maintenance. API completeness, validation, automated tests, deployment configuration, and production security hardening remain ongoing work.
