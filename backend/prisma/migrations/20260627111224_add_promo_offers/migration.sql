-- CreateTable
CREATE TABLE "PromoOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "offerPrice" DOUBLE PRECISION NOT NULL,
    "buyQuantity" INTEGER NOT NULL DEFAULT 1,
    "getQuantity" INTEGER NOT NULL DEFAULT 1,
    "getDiscount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoOfferItem" (
    "id" TEXT NOT NULL,
    "promoOfferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PromoOfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoOfferItem_promoOfferId_productId_key" ON "PromoOfferItem"("promoOfferId", "productId");

-- AddForeignKey
ALTER TABLE "PromoOfferItem" ADD CONSTRAINT "PromoOfferItem_promoOfferId_fkey" FOREIGN KEY ("promoOfferId") REFERENCES "PromoOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoOfferItem" ADD CONSTRAINT "PromoOfferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
