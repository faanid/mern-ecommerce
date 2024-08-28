# MERN E-commerce

## Overview

This is a full-stack E-commerce application built with the MERN stack (MongoDB, Express.js, React, and Node.js). It provides a platform where users can browse products, make purchases, and manage their accounts, while admins and merchants can manage product listings and track orders.

## Features

- **User Management:** Register, login, and manage user profiles.
- **Product Management:** View product listings with categories and search functionality.
- **Shopping Cart:** Add products to the cart and proceed with the checkout.
- **Payment Integration:** Secure payment gateway using Stripe/PayPal.
- **Order Management:** Track orders and view order history.
- **Admin Dashboard:** Manage products, categories, users, and orders.
- **Responsive UI:** Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend:** React.js, Redux for state management, React Router for navigation.
- **Backend:** Node.js, Express.js for building REST APIs, Mongoose for MongoDB interactions.
- **Database:** MongoDB for storing user, product, and order information.
- **Authentication:** JSON Web Tokens (JWT) for secure authentication.
- **Payment Gateway:** Stripe/PayPal for processing payments.

## Installation

### Prerequisites

- Node.js and npm installed.
- MongoDB installed and running.

### Steps to Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/faanid/mern-ecommerce.git
   cd mern-ecommerce
   ```
2. **Install backend dependencies:**
   ```bash
   npm install
   ```
3. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```
4. **Setup environment variables:**
   
   - Create a .env file in the root directory for backend configurations.
   - Add the following variables:
     
   ```bash
   MONGO_URI=your_mongoDB_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
   - Create another .env file inside the client directory for frontend configurations:
    
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   5. **Run the application:**
      
   ```bash
   npm run dev
   ```
   
