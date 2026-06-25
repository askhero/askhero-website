const participants = new Map();

export function registerDealSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join_deal", ({ dealId, userId }) => {
      const room = `deal:${dealId}`;
      socket.join(room);
      const current = participants.get(room) || new Set();
      current.add(userId);
      participants.set(room, current);
      io.to(room).emit("deal_joined", { dealId, participants: Array.from(current) });
    });

    socket.on("new_offer", ({ dealId, offer }) => {
      io.to(`deal:${dealId}`).emit("offer_received", { offer, aiAnalysis: offer?.aiAnalysis || null });
    });

    socket.on("send_message", ({ dealId, senderId, body }) => {
      io.to(`deal:${dealId}`).emit("message", {
        message: { dealId, senderId, body, createdAt: new Date().toISOString() }
      });
    });

    socket.on("deal_updated", ({ dealId, status }) => {
      io.to(`deal:${dealId}`).emit("status_changed", { dealId, newStatus: status });
    });
  });
}
