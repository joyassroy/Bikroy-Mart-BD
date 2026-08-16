import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const flashDeals = await prisma.flashDeal.findMany({});
  console.log("Flash Deals:", flashDeals.map(fd => ({ id: fd.id, type: fd.type, startsAt: fd.startsAt, endsAt: fd.endsAt, isActive: fd.isActive })));
  
  const offers = await prisma.promoOffer.findMany({});
  console.log("Promo Offers:", offers.map(o => ({ id: o.id, type: o.type, startsAt: o.startsAt, endsAt: o.endsAt, isActive: o.isActive })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
