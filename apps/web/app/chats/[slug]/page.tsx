import axios from "axios"
import ChatRoom from "../../components/ChatRoom"

interface Params {
    params: {
        slug: string
    }
}

const getRoomId = async (slug: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_URL}/room/${slug}`)
    return response.data.roomId
}

 const page = async ({ params }: Params) => {
    const slug = (await params).slug
    const roomId = await getRoomId(slug)
    console.log(roomId)
 
    return <ChatRoom slug={slug} roomId={roomId}/>
}

export default page;
