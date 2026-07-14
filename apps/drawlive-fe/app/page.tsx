
"use client"

import { useRouter } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { Circle, Eraser, Minus, Pencil, RectangleHorizontalIcon } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const Home = () => {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingRef = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })
    const [hasDrawn, setHasDrawn] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resize = () => {
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.height
        }
        resize()
        window.addEventListener("resize", resize)
        return () => window.removeEventListener("resize", resize)
    }, [])

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!
        const rect = canvas.getBoundingClientRect()
        if ("touches" in e) {
            const t = e.touches[0]
            return { x: t.clientX - rect.left, y: t.clientY - rect.top }
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        drawingRef.current = true
        lastPos.current = getPos(e)
        setHasDrawn(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!drawingRef.current) return
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return
        const pos = getPos(e)
        ctx.strokeStyle = "white"
        ctx.lineWidth = 2.5
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        lastPos.current = pos
    }

    const endDraw = () => {
        drawingRef.current = false
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
    }

    const tools = [
        { icon: Pencil, label: "pencil" },
        { icon: RectangleHorizontalIcon, label: "rect" },
        { icon: Circle, label: "circle" },
        { icon: Minus, label: "line" },
        { icon: Eraser, label: "eraser" },
    ]

    return (
        <div
            className="min-h-screen bg-black text-white"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }}
        >
            {/* Nav */}
            <Navbar/>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
                        real-time canvas
                    </p>
                    <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
                        Draw together,
                        <br />
                        live.
                    </h1>
                    <p className="text-white/50 text-lg mb-8 max-w-md">
                        Open a room, share the link, and watch every stroke appear
                        for everyone at once. No save button — it's already there.
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/signup")}
                            className="bg-white text-black rounded-md px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
                        >
                            Create a room
                        </button>
                        <button
                            onClick={() => router.push("/rooms")}
                            className="border border-white/30 rounded-md px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
                        >
                            Browse rooms
                        </button>
                    </div>
                </div>

                {/* Interactive artboard — the actual thesis of the page */}
                <div className="relative">
                    <span className="pointer-events-none absolute -top-px -left-px w-4 h-4 border-t border-l border-white/40" />
                    <span className="pointer-events-none absolute -top-px -right-px w-4 h-4 border-t border-r border-white/40" />
                    <span className="pointer-events-none absolute -bottom-px -left-px w-4 h-4 border-b border-l border-white/40" />
                    <span className="pointer-events-none absolute -bottom-px -right-px w-4 h-4 border-b border-r border-white/40" />

                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                        className="w-full h-72 sm:h-96 border border-white/15 rounded-sm bg-black/40 touch-none cursor-crosshair"
                    />

                    {!hasDrawn && (
                        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/25 font-mono text-sm">
                            try drawing here
                        </p>
                    )}

                    {hasDrawn && (
                        <button
                            onClick={clearCanvas}
                            className="absolute top-3 right-3 text-xs font-mono text-white/40 hover:text-white transition-colors"
                        >
                            clear
                        </button>
                    )}
                </div>
            </section>

            {/* How it works */}
            <section className="max-w-6xl mx-auto px-8 py-20 border-t border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-10">
                    how it works
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                    {[
                        { n: "01", title: "Create a room", body: "Spin up a fresh canvas in one click — no setup." },
                        { n: "02", title: "Share the link", body: "Send the room slug to anyone you want drawing with you." },
                        { n: "03", title: "Draw live", body: "Every shape, line, and stroke syncs the instant it's made." },
                    ].map((step) => (
                        <div key={step.n}>
                            <span className="font-mono text-white/30 text-sm">{step.n}</span>
                            <h3 className="text-lg font-medium mt-2 mb-2">{step.title}</h3>
                            <p className="text-white/45 text-sm leading-relaxed">{step.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tools */}
            <section className="max-w-6xl mx-auto px-8 py-20 border-t border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-10">
                    what's in the toolbox
                </p>
                <div className="flex flex-wrap gap-4">
                    {tools.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 border border-white/15 rounded-md px-4 py-3 hover:border-white/40 transition-colors duration-150"
                        >
                            <Icon size={16} className="text-white/70" />
                            <span className="font-mono text-sm text-white/60">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
           <Footer/>
        </div>
    )
}

export default Home