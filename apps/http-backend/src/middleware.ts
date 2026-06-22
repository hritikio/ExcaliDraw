import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();


export default function middleware(req: Request, res: Response, next: NextFunction) {
  const token= req.headers.authorization?.split(" ")[1] ?? "";

  const decoded = jwt.verify(token 
    ,process.env.JWT_SECRET as string) ;

    if (decoded){
        //@ts-ignore
        req.userId=decoded.userId;
        next()


    }
    else{
        res.status(403).json({message:"Unauthorized"});
    }

}