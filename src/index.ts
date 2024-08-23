import { Request, Response, NextFunction } from "express";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTE IMPORTS */
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";

/* GLOBAL ERROR HANDLER IMPORTS */
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";

/* CONFIGURATIONS */
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/users", userRoutes); // http://localhost:8000/users
app.use("/products", productRoutes); // http://localhost:8000/products

//ROUTE NOT FOUND - 404
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERRORS HANDLING
app.use(globalErrorHandler);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
