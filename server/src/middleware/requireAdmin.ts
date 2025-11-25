import { Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth";

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ error: "Admin access required" });
};
