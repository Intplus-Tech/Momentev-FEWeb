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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error("SocketProvider: NEXT_PUBLIC_BACKEND_URL is not configured.");
      return;
    }

    let socketInstance: Socket | null = null;
    let isMounted = true;

    const initSocket = async () => {
      const token = await getAccessToken();

      if (!isMounted) return; // Component unmounted before token resolved

      if (!token) {
        console.warn("SocketProvider: No access token available, skipping socket init.");
        return;
      }

      socketInstance = io(backendUrl, {
        auth: { token },
        path: "/socket.io",
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socketInstance.on("connect", () => {
        if (isMounted) setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        if (isMounted) setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        if (isMounted) setIsConnected(false);
      });

      // Re-fetch fresh token on reconnect attempts so expired tokens don't block reconnection
      socketInstance.io.on("reconnect_attempt", async () => {
        const freshToken = await getAccessToken();
        if (freshToken && socketInstance) {
          socketInstance.auth = { token: freshToken };
        }
      });

      if (isMounted) {
        setSocket(socketInstance);
      } else {
        // Already unmounted while connecting, clean up immediately
        socketInstance.disconnect();
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
