import { Request, Response, NextFunction } from "express";
import { fromError } from "zod-validation-error";
import AppError from "../utils/appError";

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  //Programing or other unknown error (don't leak details to client)
  if (!err.isOperational) {
    console.error("ERROR!", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
    return;
  }

  //Operational, trusted error: send msg to client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleValidationErr = (err: any) => {
  const validationErrorMessages = fromError(err);
  return new AppError(validationErrorMessages.toString(), 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const [field, constraint] = (err.meta.target as string).split("_");
  const message = `${
    field.charAt(0).toUpperCase() + field.slice(1)
  } with this ${constraint} already exists!`;
  return new AppError(message, 400);
};

const handleInitDbErr = () => {
  return new AppError(
    "Something went wrong. We couldn’t connect to the database. Please try again later.",
    500
  );
};

const handleJWTError = () => {
  return new AppError("Invalid token. Please log in again.", 401);
};

const handleJWTExpired = () => {
  return new AppError("Your token has expired. Please log in again.", 401);
};

const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log("GLOBALERROR", err.name);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  //FOR TESTING I SWITCH THIS TWO FUNCTIONS
  if (process.env.NODE_ENV === "production") {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "development") {
    switch (err.name) {
      case "PrismaClientInitializationError":
        err = handleInitDbErr();
        break;
      case "ZodError":
        err = handleValidationErr(err);
        break;
      case "JsonWebTokenError":
        err = handleJWTError();
        break;
      case "TokenExpiredError":
        err = handleJWTExpired();
        break;
    }

    switch (err?.code) {
      case "P2002":
        err = handleDuplicateFieldsDB(err);
        break;
    }

    sendErrorProd(err, res);
  }
};

export default globalErrorHandler;
