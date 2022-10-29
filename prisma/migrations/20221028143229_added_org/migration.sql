/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "organisationId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "healthLicense" TEXT,
ADD COLUMN     "identity" TEXT,
ADD COLUMN     "orgId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "userVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "image1" TEXT,
    "image2" TEXT,
    "license" TEXT,
    "permit" TEXT,
    "location" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'hospital',
    "organisationVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_email_key" ON "Organisation"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
