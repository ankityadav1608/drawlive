import { WebSocketServer } from "ws";

const socket = new WebSocketServer({
    port: 6001
})

socket.on("connection", (socket) => {
    socket.send("hello from ws backend")
})