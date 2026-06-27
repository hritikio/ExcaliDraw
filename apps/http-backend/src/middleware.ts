import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();


export default function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
        msg: "room cant be created"
    })
  }

  const token = authHeader.split(" ")[1]!;
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as { userId: string };

    console.log('decode in middleware is ',decoded )

    if (decoded){
       
        req.userId=decoded.userId ;
        next()
    }
    else{
        res.status(403).json({message:"Unauthorized"});
    }

}