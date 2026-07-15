-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID';

-- CreateTable
CREATE TABLE "RiderReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiderReview_userId_orderId_key" ON "RiderReview"("userId", "orderId");

-- AddForeignKey
ALTER TABLE "RiderReview" ADD CONSTRAINT "RiderReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderReview" ADD CONSTRAINT "RiderReview_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "RiderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderReview" ADD CONSTRAINT "RiderReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
