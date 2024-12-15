import type { NextFunction, Request, Response } from "express";

const devAllowedIps = ["127.0.0.1", "::1"];
const prodAllowedIps: string[] = [];

const allowedIps = process.env.NODE_ENV === "development" ? devAllowedIps : prodAllowedIps;

export const ipMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const realIp = req.headers['x-forwarded-for'] || req.ip;
    const clientIp = Array.isArray(realIp) 
        ? realIp[0] 
        : typeof realIp === 'string' 
            ? realIp.split(',')[0] 
            : req.ip;
    console.log('Client IP:', clientIp);
    
    if (clientIp && allowedIps.includes(clientIp)) {
        next();
    } else {
        res.status(401).send("Unauthorized IP");
    }
};
