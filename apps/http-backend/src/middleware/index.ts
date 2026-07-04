import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers["authorization"];

    if (!authHeaders || typeof authHeaders !== "string" || Array.isArray(authHeaders)) {
        res.status(401).json({
            message: "unauthorized"
        })
        return
    }

    const token = authHeaders.startsWith("Bearer ") ? authHeaders.slice(7) : authHeaders;

   try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload

    if(!decoded.userId) {
        res.status(403).json({
            message: "unauthorized"
        })
        return
    } 

    req.userId = decoded.userId
    next()

   } catch(e) {
    res.status(401).json({
        message: "unauthorized"
    })
    return
   }
}