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

### 3. Initialize the Database

Run the following commands to set up the database schema and import dummy data:

**Generate Prisma Client**

Generate the Prisma client that will be used to interact with your database:

```bash
npx prisma generate
```

**Apply Database Migrations**

Apply the database migrations to set up your schema:

```bash
npx prisma migrate dev --name init-sql
```

This command will create the necessary tables and schema in your MySQL database.

**Import Dummy Data**

Populate the database with initial dummy data for testing purposes:

```bash
npm run seed
```

### 4. Running the Project

For production mode

```bash
npm run start
```

For development mode

```bash
npm run dev
```
