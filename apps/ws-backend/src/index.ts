import { WebSocketServer,WebSocket } from "ws";

const wss= new WebSocketServer({port:8080})

wss.on("connection",(ws:WebSocket)=>{
      console.log("Client connected");


      ws.on("message",(data)=>{
        ws.send(`${data} messaged recieved `)
      })

      ws.on("close",()=>{
        console.log("Closing webSocket Server")
      })

})