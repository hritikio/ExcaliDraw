import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket, request) => {
  console.log("Client connected");

  const url = request.url;
  console.log(`Client connected with url: ${url}`);
  if (!url) {
    ws.close(1008, "Unauthorized");
    return;
  }
  const params = new URLSearchParams(url.split("?")[1]);
  const token = params.get("token") ?? "";
  if (token === "") {
    ws.close(1008, "Unauthorized");
    return;
  }
  console.log(`Token received: ${token}`);
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

  if (typeof decoded === "string") {
    ws.close(1008, "Unauthorized string");
    return;
  }

  if (!decoded || !decoded.userId) {
    ws.close(1008, "Unauthorized");
    return;
  }
  // if decode is valid then let user enter ws backend
  ws.on("message", (data) => {
    ws.send(`${data} messaged recieved `);
  });

  ws.on("close", () => {
    console.log("Closing webSocket Server");
  });
});
