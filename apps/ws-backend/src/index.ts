import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { prismaClient } from "@repo/db/client";


const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  ws: WebSocket;
  rooms: string[];
}
const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    console.log("error is", e);
    return null;
  }
}

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

  const userId = checkUser(token);

  if (!userId) {
    // if userId doesnt exist in jwt
    return ws.close(1008, "Unathorized");
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  // if decode is valid then let user enter ws backend
  ws.on("message", async (data) => {

    try {

      let parsedData // = JSON.parse(data as unknown as string); //    { type:"join_room"|"leave_room"|"chat",roomId:""iihuh,"message":"hello"}
      if(typeof data !=="string"){
        parsedData=JSON.parse(data.toString());
      }else{
        parsedData=JSON.parse(data);
      }
      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === ws);
        const roomIdStr = String(parsedData.roomId);
        if (user && !user.rooms.includes(roomIdStr)) {
          user.rooms.push(roomIdStr);
        }
        console.log(users);
      }

      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (!user) return;
        user.rooms = user.rooms.filter((x) => x !== parsedData.roomId); //the particulr room is now removed from users
      }

      if (parsedData.type === "chat") {
        const user = users.find((x) => x.ws === ws);
        if (!user) {
          return ws.close(1008, "user doesnt exist ");
        }

        const roomId = parseInt(parsedData.roomId, 10);
        const message = parsedData.message;

        if (!user.rooms.includes(String(roomId))) {
          user.rooms.push(String(roomId));
        }

        // ✅ Broadcast to all room members FIRST — never block on DB
        users.forEach((u) => {
          if (u.rooms.includes(String(roomId)) && u.ws.readyState === 1) {
            u.ws.send(
              JSON.stringify({
                type: "chat",
                message,
                roomId,
              })
            );
          }
        });

        // Save to DB in background — a failure won't interrupt real-time delivery
        prismaClient.chat.create({
          data: { roomId, message, userId },
        }).catch((err: Error) => {
          console.error("DB save failed (shape still broadcast):", err.message);
        });
      }

    } catch (err) {
      console.error("Error handling message:", err);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    }
  });


  ws.on("close", () => {
    // Remove this user from the pool so stale sockets are never broadcast to
    const idx = users.findIndex((u) => u.ws === ws);
    if (idx !== -1) users.splice(idx, 1);
    console.log(`Client disconnected. Active connections: ${users.length}`);
  });
});
