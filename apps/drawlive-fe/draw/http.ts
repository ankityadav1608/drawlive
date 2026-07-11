import axios from "axios";

export async function getExistingShapes(slug: string) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_URL}/chats/${slug}`, {
        headers: {
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZGZlNGViYS1mZGUzLTRmNGYtYjQzZi0yOGQ3ZDk3NTcxYzMiLCJpYXQiOjE3ODM1NjE3MjMsImV4cCI6MTc4NDE2NjUyM30.y0e9taR3hL8JYS6gEs_8Tu04-wzrxLhH2TohIYortI8"
        }
    })
    const messages = response.data.chats;

    const shapes = messages.map((x: { message: string }) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}