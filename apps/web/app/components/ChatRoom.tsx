import ChatRoomClient from "./ChatRoomClient";

const ChatRoom = ({ slug, roomId }: { slug: string; roomId: string }) => {
  return <ChatRoomClient slug={slug} id={roomId} />;
};

export default ChatRoom;