import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "pencil";
    points: { x: number, y: number }[]
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private slug: string;
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX: number;
    private startY: number;
    private selectedTool: Tool = "circle";
    private currentPencilPoints: { x: number, y: number }[] = []

    constructor(canvas: HTMLCanvasElement, slug: string, socket: WebSocket, roomId: string) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.slug = slug;
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.startX = 0;
        this.startY = 0;
        this.init();
        this.initHandlers();
        this.initMouseHandler();
    }

    setTool(tool: "circle" | "pencil" | "rect" | "eraser" | "line") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.slug)
        this.clearCanvas()
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);

            if (parsedData.type == "chat") {
                const shapes = JSON.parse(parsedData.message);
                this.existingShapes.push(shapes.shape)
                this.clearCanvas()
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.map((shape) => {
            if (shape.type == "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            } else if (shape.type == "circle") {
                this.ctx.beginPath()
                this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath()
            } else if (shape.type == "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath()
            } else if (shape.type == "pencil") {
                this.ctx.beginPath();
                const pts = shape.points;
                this.ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    this.ctx.lineTo(pts[i].x, pts[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }

    handleMouseDown = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.selectedTool == "pencil") {
            this.currentPencilPoints = [{ x: e.clientX, y: e.clientY }];
        }
    }

    handleMouseUp = (e: MouseEvent) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        let shape: Shape | null = null;
        if (this.selectedTool == "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height
            }

        } else if (this.selectedTool == "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius: radius
            }
        } else if (this.selectedTool == "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        } else if (this.selectedTool == "pencil") {
            if (this.currentPencilPoints.length > 1) {
                shape = {
                    type: "pencil",
                    points: this.currentPencilPoints,
                };
            }
        }

        if (!shape) {
            return;
        }
        this.existingShapes.push(shape)

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }

    handleMouseMove = (e: MouseEvent) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"

            if (this.selectedTool == "circle") {
                const radius = Math.sqrt(width * width + height * height) / 2;
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                this.ctx.beginPath()
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath()
            } else if (this.selectedTool == "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height)
            } else if (this.selectedTool == "line") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.beginPath()
                this.ctx.moveTo(this.startX, this.startY)
                this.ctx.lineTo(e.clientX, e.clientY)
                this.ctx.stroke()
                this.ctx.closePath()
            } else if (this.selectedTool == "pencil") {
                this.currentPencilPoints.push({ x: e.clientX, y: e.clientY });

                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.lineWidth = 2;
                this.ctx.lineJoin = "round";
                this.ctx.lineCap = "round";

                this.ctx.beginPath();
                const pts = this.currentPencilPoints;
                this.ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    this.ctx.lineTo(pts[i].x, pts[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    initMouseHandler() {
        this.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.canvas.addEventListener("mouseup", this.handleMouseUp);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    }
}