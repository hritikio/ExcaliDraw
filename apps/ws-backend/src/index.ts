import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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
    console.log('error is',e);
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
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data as unknown as string); //    { type:"join_room"|"leave_room"|"chat",roomId:""iihuh,"message":"hello"}
    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws); // {userId:"anfbf",ws:websocket,room:"sjdj"}
      user?.rooms.push(parsedData.roomId);
      console.log(users)
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) return;
      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId); //the particulr room is now removed from users
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            }),
          );
        }
      });
    }

    ws.send(`${data} messaged recieved `);
  });

  ws.on("close", () => {
    console.log("Closing webSocket Server");
  });
});
