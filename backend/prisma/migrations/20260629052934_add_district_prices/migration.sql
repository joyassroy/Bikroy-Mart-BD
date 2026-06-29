-- CreateTable
CREATE TABLE "DistrictPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DistrictPrice_productId_district_key" ON "DistrictPrice"("productId", "district");

-- AddForeignKey
ALTER TABLE "DistrictPrice" ADD CONSTRAINT "DistrictPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
