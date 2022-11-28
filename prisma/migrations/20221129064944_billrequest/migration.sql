/*
  Warnings:

  - You are about to drop the column `prescriptionId` on the `BillRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillRequest" DROP CONSTRAINT "BillRequest_prescriptionId_fkey";

-- AlterTable
ALTER TABLE "BillRequest" DROP COLUMN "prescriptionId",
ADD COLUMN     "billId" TEXT;

-- AlterTable
ALTER TABLE "FileStorage" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AddForeignKey
ALTER TABLE "BillRequest" ADD CONSTRAINT "BillRequest_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
