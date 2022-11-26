/*
  Warnings:

  - The `role` column on the `Individual` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Organisation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('CREATED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserTypes" AS ENUM ('INDIVIDUAL', 'ORGANIZATION', 'ADMIN');

-- CreateEnum
CREATE TYPE "IndividualRole" AS ENUM ('PATIENT', 'HEALTHCARE');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('HOSPITAL', 'PHARMACY', 'INSURANCE');

-- CreateEnum
CREATE TYPE "BillPurpose" AS ENUM ('CONSULTATION', 'PHARMACY', 'TEST');

-- AlterTable
ALTER TABLE "Individual" DROP COLUMN "role",
ADD COLUMN     "role" "IndividualRole" NOT NULL DEFAULT 'PATIENT';

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "role",
ADD COLUMN     "role" "OrgRole" NOT NULL DEFAULT 'HOSPITAL';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "type",
ADD COLUMN     "type" "UserTypes" NOT NULL DEFAULT 'INDIVIDUAL',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'CREATED';

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "purpose" "BillPurpose" NOT NULL DEFAULT 'CONSULTATION',
    "prescriptionId" TEXT,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceLogs" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insureId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,

    CONSTRAINT "InsuranceLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceLogs" ADD CONSTRAINT "InsuranceLogs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceLogs" ADD CONSTRAINT "InsuranceLogs_insureId_fkey" FOREIGN KEY ("insureId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceLogs" ADD CONSTRAINT "InsuranceLogs_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
