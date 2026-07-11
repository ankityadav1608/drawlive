import { Game } from "@/draw/Game";
import { Circle, Eraser, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Tool = "circle" | "pencil" | "rect" | "eraser";

const Canvas = ({
  slug,
  roomId,
  socket,
}: {
  slug: string;
  roomId: string;
  socket: WebSocket;
}) => {

  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const gameRef = useRef<Game | null>(null)
  const [game, setGame] = useState<Game>()
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    game?.setTool(selectedTool)
  }, [selectedTool, game])

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, slug, socket, roomId)
      gameRef.current = g;
      setGame(g)
    }

    return () => {
      gameRef.current?.destroy()
    }
  }, [canvasRef]);

  return (
    <div className="h-screen overflow-hidden">
      <canvas ref={canvasRef} width={1800} height={1080}></canvas>
      
      <button
        onClick={() => {
          setSelectedTool("eraser");
        }}
        className={`bg-white text-black p-3 rounded-[100%] absolute right-5 top-5 cursor-pointer ${selectedTool === "eraser" ? 'text-gray-500' : ''}`}
      >
        <Eraser />
      </button>

      <button
        onClick={() => {
          setSelectedTool("pencil");
        }}
        className={`bg-white text-black p-3 rounded-[100%] absolute right-20 top-5 cursor-pointer ${selectedTool === "pencil" ? 'text-gray-500' : ''}`}
      >
        <Pencil />
      </button>

      <button
        onClick={() => {
          setSelectedTool("rect");
        }}
       className={`bg-white text-black p-3 rounded-[100%] absolute right-35 top-5 cursor-pointer ${selectedTool === "rect" ? 'text-gray-500' : ''}`}
      >
        <RectangleHorizontalIcon />
      </button>

      <button
        onClick={() => {
          setSelectedTool("circle");
        }}
        className={`bg-white text-black p-3 rounded-[100%] absolute right-50 top-5 cursor-pointer ${selectedTool === "circle" ? 'text-gray-500' : ''}`}
      >
        <Circle />
      </button>
    </div>
  );
};

export default Canvas;
