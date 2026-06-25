import bcrypt from "bcryptjs";
import { prisma } from "./client.js";

const passwordHash = await bcrypt.hash("test123", 12);

const buyer1 = await prisma.user.upsert({
  where: { email: "buyer1@test.com" },
  update: {},
  create: { email: "buyer1@test.com", passwordHash, role: "BUYER", name: "Test Buyer One", phone: "+15555550101", preQualLimit: 650000, preQualRate: 6.5 }
});
await prisma.user.upsert({
  where: { email: "buyer2@test.com" },
  update: {},
  create: { email: "buyer2@test.com", passwordHash, role: "BUYER", name: "Test Buyer Two", phone: "+15555550102", preQualLimit: 540000, preQualRate: 6.5 }
});
const agent1 = await prisma.user.upsert({
  where: { email: "agent1@test.com" },
  update: {},
  create: { email: "agent1@test.com", passwordHash, role: "AGENT", name: "Test Agent One", phone: "+15555550201" }
});
await prisma.user.upsert({
  where: { email: "agent2@test.com" },
  update: {},
  create: { email: "agent2@test.com", passwordHash, role: "AGENT", name: "Test Agent Two", phone: "+15555550202" }
});

const properties = [
  ["LOCAL TEST FIXTURE - Charlotte", "Charlotte", "NC", "28202", 575000, 87, "A", "A+", "B+", "Low", 34, 560000],
  ["LOCAL TEST FIXTURE - Raleigh", "Raleigh", "NC", "27601", 515000, 82, "A", "B+", "A", "Low", 18, 505000],
  ["LOCAL TEST FIXTURE - Atlanta", "Atlanta", "GA", "30303", 625000, 79, "B+", "B", "B+", "Medium", 27, 600000],
  ["LOCAL TEST FIXTURE - Nashville", "Nashville", "TN", "37201", 690000, 81, "B+", "A", "B", "Medium", 42, 665000]
];

const created = [];
for (const [address, city, state, zip, listPrice, heroScore, valueGrade, negotiationGrade, schoolRating, insuranceRisk, daysOnMarket, comparableValue] of properties) {
  const property = await prisma.property.upsert({
    where: { mlsId: `TEST-${city.toUpperCase()}` },
    update: {},
    create: { address, city, state, zip, listPrice, heroScore, valueGrade, negotiationGrade, schoolRating, insuranceRisk, daysOnMarket, comparableValue, mlsId: `TEST-${city.toUpperCase()}` }
  });
  created.push(property);
}

const deal = await prisma.deal.create({
  data: {
    propertyId: created[0].id,
    buyerId: buyer1.id,
    agentId: agent1.id,
    status: "NEGOTIATING",
    offers: {
      create: [
        { amount: 535000, submittedBy: "BUYER", status: "COUNTERED" },
        { amount: 565000, submittedBy: "SELLER", status: "COUNTERED" },
        { amount: 548000, submittedBy: "BUYER", status: "PENDING" }
      ]
    },
    contingencies: {
      create: [
        { type: "Inspection", enabled: true },
        { type: "Financing", enabled: true },
        { type: "Appraisal", enabled: true },
        { type: "Sale of Home", enabled: false }
      ]
    }
  }
});

console.log("Seeded Deal Room test users and local test fixture deal", { dealId: deal.id });
