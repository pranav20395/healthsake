/*
  Warnings:

  - A unique constraint covering the columns `[receipt]` on the table `RazorpayReceipts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayReceipts_receipt_key" ON "RazorpayReceipts"("receipt");
