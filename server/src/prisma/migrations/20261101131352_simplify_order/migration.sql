/*
  Warnings:

  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `usersId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productsId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_usersId_fkey";

-- DropIndex
DROP INDEX "orders_usersId_idx";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "createdAt",
DROP COLUMN "shippingAddress",
DROP COLUMN "total_amount",
DROP COLUMN "usersId";

-- DropTable
DROP TABLE "order_items";
