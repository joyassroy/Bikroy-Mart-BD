import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prodId = 'ff8c7075-c089-4132-9508-2c7b1b34968e';
  
  const flashDeals = await prisma.flashDeal.findMany({ where: { productId: prodId } });
  const promoItems = await prisma.promoOfferItem.findMany({ 
    where: { productId: prodId },
    include: { promoOffer: true }
  });
  
  console.log("Flash Deals for Product:", flashDeals);
  console.log("Promo Offers for Product:", promoItems);
}
main().catch(console.error).finally(() => prisma.$disconnect());
