  import { Request, Response, NextFunction } from "express";
  import jwt from "jsonwebtoken";
  import User from "../models/User";

  export interface AuthRequest extends Request {
    user?: { _id: string; role: "user" | "admin" };
  }

  export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string; role: "user" | "admin" };
      const user = await User.findById(decoded._id).select("_id role");
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      req.user = { _id: user._id.toString(), role: user.role as "user" | "admin" };
      next();
    } catch {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
