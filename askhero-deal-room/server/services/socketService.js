let ioRef;

export function setSocketServer(io) {
  ioRef = io;
}

export function emitToDeal(dealId, event, payload) {
  if (ioRef) ioRef.to(`deal:${dealId}`).emit(event, payload);
}
