import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SOCKET_URL = "https://meetspace-zt28.onrender.com:2001";
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => {
    if (!SOCKET_URL) {
      console.error("Socket.IO connection failed");
      return;
    }
    io(SOCKET_URL);
  }, []);
  // if (!socket) {
  //   return <div>Socket.IO connection failed</div>;
  // }
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
