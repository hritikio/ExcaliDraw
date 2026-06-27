// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import { signInSchema, signUpSchema ,createRoomSchema} from "./schema/auth";
import jwt from "jsonwebtoken"
import { prismaClient } from "@repo/db/client";
import dotenv from "dotenv";
dotenv.config();
import middleware from "./middleware";
import bcrypt from "bcrypt"
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors({origin:"http://localhost:3000"}))
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});


console.log("here is httpbackend jwt ",process.env.JWT_SECRET);


app.post("/signup", async (req: Request, res: Response) => {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    //if result fails
    return res.status(400).json({
      message: "Invalid request data",
      errors: result.error.format,
    });
  } else {
    //if result is success
    try {
      const hashedPassword = await bcrypt.hash(result.data.password,10);
      console.log("hashedPassword",hashedPassword);
      const user = await prismaClient.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          password: hashedPassword,
        },
      });
      res.status(200).json({ message: "User signed up successfully " ,userId:user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

app.post("/signin",async  (req: Request, res: Response) => {

  const result = signInSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request data",
      errors: result.error.format(),
    });
  } else {
    //add bcrypt and database logic here
    const { email ,password} = result.data;
    const user = await prismaClient.user.findFirst({
      where:{
        email   // find that user by email 
      }
    })
    

    
    if(typeof user?.password =="undefined" || !user) {
      return res.status(400).json({ message: "Invalid password or user doesnt exist" });
    }
    //now check if our pass matches the hash pass 
    const isPasswordCorrect= await bcrypt.compare(password,user.password)

    if(!isPasswordCorrect){
      // password is wrong 
      return res.status(403).json({
        msg:"Incorrect password "
      })
    }
    console.log(`the user for sign in is  `,user);
    //password is correct 
    const userId= user.id

    const token = await jwt.sign({userId},process.env.JWT_SECRET as string,{expiresIn:"7d"});
     console.log("your jwt token is ",token);
    res.status(200).json({ message: "User signed in successfully",token });
  }
});

app.post("/room", middleware,async (req: Request, res: Response) => {
  const result = createRoomSchema.safeParse(req.body);
   if (!result.success) {
    //if result fails
    return  res.status(400).json({
      message: "Invalid Room data",
      errors: result.error.format(),
    });
  }

  const userId= req.userId

  if(!userId){
    return res.status(400).json({
      msg:"user doesnt exist "
    })
  }
  try{
  const room = await prismaClient.room.create({
      data:{
        slug:result.data.roomName,
        adminId:userId
        
      }
  })
  res.json({ msg:"Room created",roomId:room.id });
}
catch(e){
  return res.status(500).json({
    msg:"Same RoomId cant be created  "
  })
}
  
});

app.get("/chats/:roomId",middleware,async (req:Request,res:Response)=>{
  const roomId = Number(req.params.roomId);
  try{
    const messages = await prismaClient.chat.findMany({
      where:{
        roomId
      },
      take:50 //only take first 50 messages
    })

    res.status(200).json({
      messages
    })
  }
  catch(e){
    res.status(500).json({
      err:e,
      message:"error occured while fetching chats "
    })
  }
})

app.get("/room/:slug",  async (req: Request<{slug:string}>, res: Response) => {
  const slug = req.params.slug;
  try {
    const roomId = await prismaClient.room.findFirst({
      where: {
        slug
      },
     
    });

    res.status(200).json({
      roomId,
    });
  } catch (e) {
    res.status(500).json({
      err: e,
      message: "error occured while fetching chats ",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
