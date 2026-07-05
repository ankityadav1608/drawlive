"use client";

import { useEffect, useState } from "react";

const useSocket = () => {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      setLoading(false);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setLoading(true);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
};

export default useSocket;