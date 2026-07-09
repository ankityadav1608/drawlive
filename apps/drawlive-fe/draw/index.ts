import axios from "axios";

type Shape = {
    type: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    center: number;
}



export default async function initDraw(canvas: HTMLCanvasElement, slug: string, socket: WebSocket, roomId: string ) {

    const existingShapes: Shape[] = await getChats(slug);

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            console.log(parsedData)

            if(parsedData.type == "chat") {
                const shapes = JSON.parse(parsedData.message);
                console.log(shapes)
                existingShapes.push(shapes.shape)
                clearCanvas(ctx, existingShapes, canvas)
            }
        }

        clearCanvas(ctx, existingShapes, canvas)

        let clicked = false;
        let startX = 0;
        let startY = 0;

        const handleMouseDown = (e: MouseEvent) => {
            clicked = true;
            startX = e.clientX;
            startY = e.clientY;
        };

        const handleMouseUp = (e: MouseEvent) => {
            clicked = false;
            const width = e.clientX - startX;
                const height = e.clientY - startY;

                const shape: Shape = {
                type: "rectangle",
                x: startX,
                y: startY,
                width,
                height
            }

            existingShapes.push(shape)

            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape
                }),
                roomId: roomId
            }))
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (clicked) {
                const width = e.clientX - startX;
                const height = e.clientY - startY;
               clearCanvas(ctx, existingShapes, canvas)
                ctx.strokeStyle = "rgba(255, 255, 255)"
                ctx.strokeRect(startX, startY, width, height)
            }
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mousemove", handleMouseMove);

        // cleanup — runs before the effect re-runs, and on unmount
        
}

function clearCanvas(ctx: CanvasRenderingContext2D,existingShapes: Shape[], canvas: HTMLCanvasElement) {
     ctx.clearRect(0,0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    existingShapes.map((shape) => {
        if(shape.type == "rectangle") {
            ctx.strokeStyle = "rgba(255, 255, 255)"
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
        }
    })
}

async function getChats(slug: string) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_URL}/chats/${slug}`, {
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZGZlNGViYS1mZGUzLTRmNGYtYjQzZi0yOGQ3ZDk3NTcxYzMiLCJpYXQiOjE3ODM1NjE3MjMsImV4cCI6MTc4NDE2NjUyM30.y0e9taR3hL8JYS6gEs_8Tu04-wzrxLhH2TohIYortI8"
            }
        })
    const messages = response.data.chats;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}