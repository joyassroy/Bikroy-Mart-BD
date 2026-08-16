import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // next week

  // Fix Flash Deals
  await prisma.flashDeal.updateMany({
    where: {
      type: { in: ['EXECUTIVE', 'STOCK_CLEARANCE'] }
    },
    data: {
      startsAt: past,
      endsAt: future
    }
  });

  // Fix Promo Offers
  await prisma.promoOffer.updateMany({
    where: {
      type: { in: ['COMBO', 'BOGO', 'CUSTOM'] }
    },
    data: {
      startsAt: past,
      endsAt: future
    }
  });
  
  console.log("Updated dates for deals and offers to make them active now.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
