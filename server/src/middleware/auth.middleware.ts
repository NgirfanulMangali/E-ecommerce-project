import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/auth.type.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.id === "string" &&
   typeof payload.email === "string";
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication required",
      code: "UNAUTHENTICATED",
    });
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      message: "Authentication required",
      code: "UNAUTHENTICATED",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isAuthUser(decoded)) {
      res.status(401).json({
        message: "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
}
