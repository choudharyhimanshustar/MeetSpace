import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ user, children }) => {
  const socket = useMemo(() => {
    if (user) {
      return io("https://meet-space-gsnh.vercel.app", {
        auth: { token: user.token }, // Optionally send token for authentication
      });
    }
    return null; // No socket connection if not logged in
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};