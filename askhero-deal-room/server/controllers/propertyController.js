import { prisma } from "../prisma/client.js";

export async function getProperty(req, res) {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json({ property });
}

export async function searchProperties(req, res) {
  const { city, minPrice, maxPrice } = req.query;
  const properties = await prisma.property.findMany({
    where: {
      city: city ? { equals: String(city), mode: "insensitive" } : undefined,
      listPrice: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined
      }
    },
    take: 50
  });
  res.json({ properties });
}
