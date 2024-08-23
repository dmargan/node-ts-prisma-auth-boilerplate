Node.js API with user auth implemented using JWT.

MySQL is used for the database.

To run the project run:

1. npm install

2. add needed env variables

3. DATABASE INIT:
   npx prisma generate
   npx prisma migrate dev --name init-sql
   npm run seed -> import dummy data
