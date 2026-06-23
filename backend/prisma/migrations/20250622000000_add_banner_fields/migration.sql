-- AlterTable: Add new fields to Banner table
ALTER TABLE "Banner" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Banner" ADD COLUMN "mobileImage" TEXT;
ALTER TABLE "Banner" ADD COLUMN "bgColor" TEXT;
ALTER TABLE "Banner" ALTER COLUMN "image" DROP NOT NULL;
