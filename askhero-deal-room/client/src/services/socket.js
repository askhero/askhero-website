import { io } from "socket.io-client";

export function createSocket() {
  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001", {
    autoConnect: true
  });
}
