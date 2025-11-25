import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

/**
 * Optional authentication middleware.
 * - If token is valid -> attach `req.user`
 * - If no/invalid token -> continue as guest (no error)
 *
 * IMPORTANT: Uses the SAME token name & payload shape as `requireAuth`.
 */
export async function requireAuthOptional(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // Use the SAME cookie/header as requireAuth
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) return next();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { _id: string; role: "user" | "admin" };

    const user = await User.findById(decoded._id).select(
      "_id name email role"
    );
    if (!user) return next();

    (req as any).user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch {
    // If token is invalid → just behave as guest
    return next();
  }
}
