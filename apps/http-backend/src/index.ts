// src/index.ts
import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});




// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});