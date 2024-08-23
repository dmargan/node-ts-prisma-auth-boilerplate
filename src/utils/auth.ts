import { Response } from "express";
import bcrypt from "bcryptjs";
import { promisify } from "util";
import jwt, { JwtPayload, Secret, VerifyErrors } from "jsonwebtoken";
import { User } from "@prisma/client";

// hashing function used for passwords
export async function hashPassword(
  password: string
): Promise<string | undefined> {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (e) {
    return undefined;
  }
}

export function createJWTToken(user: User) {
  const jwtSecret = process.env.JWT_SECRET;
  const { id, name, role } = user;

  if (!jwtSecret) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  const token = jwt.sign({ id, name, role }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
}

export function setAuthCookie(res: Response, token: string) {
  const cookieExpiresIn = process.env.JWT_COOKIE_EXPIRES_IN
    ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN)
    : 90; // Default to 90 days if not set

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
}

export async function comparePasswords(
  candidatePassword: string,
  userPassword: string
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
}

export const verifyJWT = promisify(
  (
    token: string,
    secret: Secret,
    callback: (
      err: VerifyErrors | null,
      decoded: string | JwtPayload | undefined
    ) => void
  ) => {
    jwt.verify(token, secret, callback);
  }
);
