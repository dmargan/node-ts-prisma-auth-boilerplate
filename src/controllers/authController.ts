import { Request, Response, NextFunction } from "express";
import { PrismaClient, User, UserRole } from "@prisma/client";
import { signupSchema, loginSchema } from "../schemas/user";
import {
  hashPassword,
  createJWTToken,
  setAuthCookie,
  comparePasswords,
  verifyJWT,
} from "../utils/auth";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();

const createSendToken = (user: User, statusCode: number, res: Response) => {
  const token = createJWTToken(user);
  setAuthCookie(res, token);

  // Exclude password from the user object before sending it in the response
  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userWithoutPassword,
    },
  });
};

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Validate signup data
    const validatedData = signupSchema.parse(req.body);

    // 2. Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return next(new AppError(`User with this email already exists`, 400));
    }

    // 3. Hash the password
    const hashedPassword = await hashPassword(validatedData.password);
    if (!hashedPassword) {
      throw new AppError(
        `We encountered an issue while setting up your account. Please try again.`,
        400
      );
    }

    // 4. Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    // 5. Send the token and user data
    createSendToken(newUser, 201, res);
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Validate login data
    const validatedData = loginSchema.parse(req.body);

    // 2. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // 3. Check if the user exists and the password is correct
    if (
      !user ||
      !(await comparePasswords(validatedData.password, user.password))
    ) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 4. Send the token and user data
    createSendToken(user, 200, res);
  }
);

const logout = (_req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

export interface CustomRequest extends Request {
  user?: User;
}

const protect = catchAsync(
  async (
    req: CustomRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    //1. Check if token exist on request (header)
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (
      !token ||
      typeof token !== "string" ||
      token.trim() === "" ||
      token === "loggedout" ||
      token === "null" ||
      token === "undefined"
    ) {
      return next(
        new AppError("You are not logged in! Please log in to get access", 401)
      );
    }

    // 2. Token verifiction
    const decoded = await verifyJWT(token, process.env.JWT_SECRET as Secret);

    if (!decoded || typeof decoded === "string" || !decoded.id) {
      return next(new AppError("Invalid token! Please log in again!", 401));
    }

    //3. Check if user still exist
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does not longer exist.",
          401
        )
      );
    }

    //GRAND ACCESS TO PROTECTED ROUTE
    currentUser.password = "";
    req.user = currentUser;
    next();
  }
);

export const restrictTo =
  (...roles: UserRole[]) =>
  (req: CustomRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };

export default { signup, login, logout, protect, restrictTo };
