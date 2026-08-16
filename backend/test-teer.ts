import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prodId = '5aeba0a0-ccc0-4805-a8bf-0cd614f6efdf';
  
  const flashDeals = await prisma.flashDeal.findMany({ where: { productId: prodId } });
  
  console.log("Flash Deals for Teer:", flashDeals);
}
main().catch(console.error).finally(() => prisma.$disconnect());
