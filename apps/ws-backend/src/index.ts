import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/prisma";

const wss = new WebSocketServer({
  port: 6001,
});

//we are not persisting data in the database
//user can send data to any room if he or she has joined room or not
//add rate limiting also currently a user can send thousands of messages
interface User {
  socket: WebSocket;
  userId: string;
  rooms: string[];
}

const users: User[] = [];

wss.on("connection", (socket, request) => {
  try {
    const url = request.url;
    if (!url) return;

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";

    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

    if (!decoded.userId) {
      socket.close();
      return;
    }

    const userId = decoded.userId;

    if (!userId) {
      socket.close();
      return;
    }

    users.push({
      socket,
      userId,
      rooms: [],
    });
  } catch (e) {
    console.error(e);
    socket.close();
    return;
  }

  socket.on("message",async (data) => {
    
    const parsedData = JSON.parse(data.toString());

    const user = users.find((x) => x.socket === socket);

    if (parsedData.type == "join_room") {
      //check if the room exists or in case of advance use case you can also check if he is allowed to join this room
      user?.rooms.push(parsedData.roomId);
      console.log("joined room successfully")
    }

    if (parsedData.type == "leave_room") {
      if (!user) return;
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    if (parsedData.type == "chat") {
      //check if the message is not obnoxious or the message isn't too long
      //add queues for chat storage in db so that the message appears to everyone fast
      if(!user) return
      await prisma.chat.create({
        data: {
            message: parsedData.message,
            roomId:Number(parsedData.roomId),
            userId: user.userId
        }
      })
      users.forEach((user) => {
        if (user.rooms.includes(parsedData.roomId)) {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              message: parsedData.message,
              roomId: parsedData.roomId,
            }),
          );
        }
      });
    }
  });
});
