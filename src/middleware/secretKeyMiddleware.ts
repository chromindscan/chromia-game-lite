import type { NextFunction, Request, Response } from "express";

const secretKey = process.env.SERVER_SECRET_KEY;

export const secretKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-secret-key"] !== secretKey) {
    res.status(401).send("Unauthorized Secret Key");
  } else {
    next();
  }
};
