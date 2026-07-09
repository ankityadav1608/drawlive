import RoomCanvas from "@/components/RoomCanvas";
import axios from "axios";


export default async function CanvasPage({ params }: { params: { slug: string }}) {

   const slug = (await params).slug;
   const roomId = await getRoomId(slug)
   console.log(roomId)
   console.log(slug);

   return <RoomCanvas slug={slug} roomId={roomId}/>
}


const getRoomId = async (slug: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_URL}/room/${slug}`,{
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZGZlNGViYS1mZGUzLTRmNGYtYjQzZi0yOGQ3ZDk3NTcxYzMiLCJpYXQiOjE3ODM1NjE3MjMsImV4cCI6MTc4NDE2NjUyM30.y0e9taR3hL8JYS6gEs_8Tu04-wzrxLhH2TohIYortI8"
            }
        })
    return response.data.roomId
}