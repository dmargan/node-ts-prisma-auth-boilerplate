# Node.js API with JWT Authentication

This project is a Node.js API that implements user authentication using JSON Web Tokens (JWT). It uses MySQL as the database and Prisma as the ORM.

## Getting Started

To set up and run the project, follow these steps:

### 1. Install Dependencies

First, install the required Node.js dependencies:

```bash
npm install
```

### 2. Set Up Environment Variables

Create a .env file in the root of the project directory and add the required environment variables. Here’s an example .env file:

```bash
PORT=8000
NODE_ENV=development
DATABASE_URL=mysql://user:password@localhost:3306/yourdatabase
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=30
```
