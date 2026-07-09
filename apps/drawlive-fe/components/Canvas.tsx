import initDraw from "@/draw";
import { useEffect, useRef } from "react";

const Canvas = ({slug, roomId, socket}: {slug: string,roomId: string, socket: WebSocket}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
       if(canvasRef.current) {
        initDraw(canvasRef.current, slug, socket, roomId)
       }
    }, [canvasRef, slug]);

  return (
    <div>
       <canvas ref={canvasRef} width={1800} height={1080}></canvas>
    </div>
  )
}

export default Canvas