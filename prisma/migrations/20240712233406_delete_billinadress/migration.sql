/*
  Warnings:

  - You are about to drop the `BillAddres` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillAddres" DROP CONSTRAINT "BillAddres_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;

-- DropTable
DROP TABLE "BillAddres";
