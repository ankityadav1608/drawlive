"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";

interface Message {
  message: string;
}

const ChatRoomClient = ({
  slug,
  id,
}: {
  slug: string;
  id: string;
}) => {
  const { socket } = useSocket();

  const [chats, setChats] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchChats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HTTP_URL}/chats/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats(response.data.chats);
    } catch (error) {
      console.error(error);
    }
  };

  const joinRoom = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "join_room",
        roomId: id,
      })
    );
  };

  const leaveRoom = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "leave_room",
        roomId: id,
      })
    );
  };

  const handleSocketMessage = (event: MessageEvent) => {
    const parsedData = JSON.parse(event.data);

    if (parsedData.type === "chat") {
      setChats((prev) => [
        ...prev,
        { message: parsedData.message },
      ]);
    }
  };

  const sendMessage = () => {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !currentMessage.trim()
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: id,
        message: currentMessage,
      })
    );

    setCurrentMessage("");
  };

  useEffect(() => {
    fetchChats();
  }, [slug]);

  useEffect(() => {
    if (!socket) return;

    if (socket.readyState === WebSocket.OPEN) {
      joinRoom();
    }

    socket.addEventListener("message", handleSocketMessage);

    return () => {
      leaveRoom();
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [socket]);

  return (
    <div>
      {chats.map((chat, index) => (
        <div key={index}>{chat.message}</div>
      ))}

      <input
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Enter message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoomClient;