"use client"
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

const RoomCanvas = ({slug, roomId}: {slug: string, roomId: string}) => {
  useProtectedRoute()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const strip = token?.split(" ")[1]
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL!}?token=${strip}`)
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