-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTopSelling" BOOLEAN NOT NULL DEFAULT false;
