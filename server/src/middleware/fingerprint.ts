import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
export function fingerprint(req: Request, _res: Response, next: NextFunction) {
  if (!("fingerprint" in req)) (req as any).fingerprint = undefined;
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "0.0.0.0";
  const ua = req.headers["user-agent"] || "unknown";
  (req as any).fingerprint = crypto.createHash("sha1").update(`${ip}|${ua}`).digest("hex");
  next();
}
