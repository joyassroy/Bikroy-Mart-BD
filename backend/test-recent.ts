import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.promoOffer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { items: true }
  });
  console.log(JSON.stringify(offers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
