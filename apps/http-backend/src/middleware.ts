import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();


export default function middleware(req: Request, res: Response, next: NextFunction) {
  const token= req.headers.authorization;
  console.log(token)
  if(!token){
    return res.status(403).json({
        msg:"room cant be created"
    })
  }

  const decoded  = jwt.verify(token ,process.env.JWT_SECRET as string)as{userId:string} ;

    console.log('decode in middleware is ',decoded )

    if (decoded){
       
        req.userId=decoded.userId ;
        next()
    }
    else{
        res.status(403).json({message:"Unauthorized"});
    }

}