// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import { signInSchema, signUpSchema } from "./schema/auth";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import middleware from "./middleware";
dotenv.config()


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

const result = signUpSchema.safeParse({
  name: "Hritik",
  email: "test@test.com",
  password: "123456",
});

console.log(result);
console.log(process.env.JWT_SECRET);

// app.use("/",)

app.post("/signup", (req: Request, res: Response) => {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    //if result fails
    res.status(400).json({
      message: "Invalid request data",
      errors: result.error.format(),
    });
  } else {
    //if result is success
    
    res.status(200).json({ message: "User signed up successfully "});
    //add bcrypt and database logic here

  }
});

app.post("/signin", (req: Request, res: Response) => {

  const result = signInSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid request data",
      errors: result.error.format(),
    });
  } else {
    //add bcrypt and database logic here
    const { email } = result.data;
    const token = jwt.sign(userId,process.env.JWT_SECRET as string,{expiresIn:'7d'});
     console.log(token);
    res.status(200).json({ message: "User signed in successfully",token });
  }
});

app.post("/room", middleware,(req: Request, res: Response) => {
  res.json({ roomId: 123 });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
