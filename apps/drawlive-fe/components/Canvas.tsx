"use client"

import { Game } from "@/draw/Game";
import { CaseSensitive, Circle, Eraser, Minus, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Tool = "circle" | "pencil" | "rect" | "eraser" | "line" | "text";

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

  const tools: { id: Tool; icon: typeof Pencil; label: string }[] = [
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "rect", icon: RectangleHorizontalIcon, label: "Rectangle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    {id: "text", icon: CaseSensitive, label: "text"}
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <canvas ref={canvasRef} width={1800} height={1080}></canvas>

      {/* Room label */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="font-mono text-sm text-white/50">{slug}</span>
      </div>

      {/* Floating toolbar */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 border border-white/15 rounded-lg p-1.5 backdrop-blur-sm">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setSelectedTool(id)}
            className={`p-2.5 rounded-md transition-colors duration-150 cursor-pointer ${
              selectedTool === id
                ? "bg-white text-black"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Canvas;