import { useEffect, useMemo, useState } from "react";
import { createSocket } from "../services/socket";

export function useSocket(dealId, userId, handlers = {}) {
  const [connected, setConnected] = useState(false);
  const socket = useMemo(() => createSocket(), []);
  const offerHandler = useMemo(() => handlers.offer_received || (() => {}), [handlers.offer_received]);
  const messageHandler = useMemo(() => handlers.message || (() => {}), [handlers.message]);
  const statusHandler = useMemo(() => handlers.status_changed || (() => {}), [handlers.status_changed]);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      if (dealId && userId) socket.emit("join_deal", { dealId, userId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("offer_received", offerHandler);
    socket.on("message", messageHandler);
    socket.on("status_changed", statusHandler);
    return () => socket.disconnect();
  }, [socket, dealId, userId, offerHandler, messageHandler, statusHandler]);

  return { socket, connected, emit: socket.emit.bind(socket) };
}
