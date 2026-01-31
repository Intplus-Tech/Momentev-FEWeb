"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/session";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      const token = await getAccessToken(); // Get token from server action (client-side safe)
      // Note: getAccessToken is a server action, so it returns a promise.

      if (!token) {
        console.warn("SocketProvider: No access token available");
        return;
      }

      // Backend URL should be defined
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://momentev-be.onrender.com";

      const socketInstance = io(backendUrl, {
        auth: {
          token: token, // Pass token in auth object
        },
        path: "/socket.io",
        // Recommended configurations
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setIsConnected(false);
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
      };
    };

    const cleanupPromise = initSocket();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
