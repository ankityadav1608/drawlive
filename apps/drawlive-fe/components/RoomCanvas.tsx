"use client"
import { useEffect, useState } from "react";
import Canvas from "./Canvas";

const RoomCanvas = ({slug, roomId}: {slug: string, roomId: string}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  
  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL!}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZGZlNGViYS1mZGUzLTRmNGYtYjQzZi0yOGQ3ZDk3NTcxYzMiLCJpYXQiOjE3ODM1NjE3MjMsImV4cCI6MTc4NDE2NjUyM30.y0e9taR3hL8JYS6gEs_8Tu04-wzrxLhH2TohIYortI8`)
    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "join_room",
        roomId: roomId
      }))
    }
  }, [])

  if(!socket) {
    return <div>
      Connecting to server...
    </div>
  }


    return <div>
       <Canvas slug={slug} roomId={roomId} socket={socket}/>
    </div>
}

export default RoomCanvas