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
} | {
    type: "text";
    x: number;
    y: number;
    content: string;
    fontSize: number;
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

    setTool(tool: "circle" | "pencil" | "rect" | "eraser" | "line" | "text") {
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
            } else if (shape.type == "text") {
                this.ctx.fillStyle = "rgba(255, 255, 255)";
                this.ctx.font = `${shape.fontSize}px sans-serif`;
                this.ctx.textBaseline = "top";
                this.ctx.fillText(shape.content, shape.x, shape.y);
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
        console.log("mousedown, tool =", this.selectedTool);
        if (this.selectedTool == "text") {
            e.preventDefault()
            this.createTextInput(e.clientX, e.clientY);
            return;
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

    createTextInput(x: number, y: number) {
        const fontSize = 20;

        const input = document.createElement("textarea");
        input.style.position = "fixed";
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;
        input.style.background = "transparent";
        input.style.border = "1px dashed rgba(255, 255, 255, 0.4)";
        input.style.outline = "none";
        input.style.color = "white";
        input.style.font = `${fontSize}px sans-serif`;
        input.style.lineHeight = "1.3";        // room for ascenders/descenders
        input.style.padding = "2px 4px";       // small breathing room, no clipping
        input.style.margin = "0px";
        input.style.resize = "none";
        input.style.overflow = "hidden";
        input.style.whiteSpace = "pre";        // don't wrap while measuring width
        input.style.zIndex = "1000";
        input.rows = 1;

        document.body.appendChild(input);
        setTimeout(() => input.focus(), 0);

        const resize = () => {
            this.ctx.font = `${fontSize}px sans-serif`;
            const width = this.ctx.measureText(input.value || " ").width;
            input.style.width = `${width + 12}px`; // +12 = padding + a little room for the caret

            input.style.height = "auto";
            input.style.height = `${input.scrollHeight}px`;
        };

        resize(); // set initial size immediately, don't wait for first keystroke
        input.addEventListener("input", resize);

        const commit = () => {
            const content = input.value.trim();
            if (document.body.contains(input)) {
                document.body.removeChild(input);
            }

            if (!content) return;

            const shape: Shape = {
                type: "text",
                x,
                y,
                content,
                fontSize
            };

            this.existingShapes.push(shape);
            this.clearCanvas();

            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: this.roomId
            }));
        };

        input.addEventListener("blur", commit);

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                input.blur();
            }
            if (e.key === "Escape") {
                input.removeEventListener("blur", commit);
                if (document.body.contains(input)) {
                    document.body.removeChild(input);
                }
            }
        });
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