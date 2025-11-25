import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
      role: "guest" | "admin";
      email?: string;
      name?: string;
    };
  }
}
