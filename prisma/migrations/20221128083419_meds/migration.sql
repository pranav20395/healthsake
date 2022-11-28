/*
  Warnings:

  - You are about to drop the column `prescriptionId` on the `Bill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_prescriptionId_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "prescriptionId",
ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "barcode" TEXT;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- CreateTable
CREATE TABLE "MedicinesAvailable" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,

    CONSTRAINT "MedicinesAvailable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
