export function errorHandler(error, _req, res, _next) {
  void _next;
  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
}
