/*
  Warnings:

  - You are about to drop the column `name` on the `FileStorage` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `healthLicense` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `identity` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `image1` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `image2` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `license` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `permit` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "FileStorage" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Individual" DROP COLUMN "address",
DROP COLUMN "healthLicense",
DROP COLUMN "identity",
DROP COLUMN "image",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "identityId" TEXT,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "licenseId" TEXT;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "image1",
DROP COLUMN "image2",
DROP COLUMN "license",
DROP COLUMN "location",
DROP COLUMN "permit",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "licenseId" TEXT,
ADD COLUMN     "permitId" TEXT;

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressProof" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "AddressProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityProof" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "IdentityProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permit" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Permit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadAccessUsers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadAccessUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ImageToOrganisation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToOrganisation_AB_unique" ON "_ImageToOrganisation"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToOrganisation_B_index" ON "_ImageToOrganisation"("B");

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "IdentityProof"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "AddressProof"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "AddressProof"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "Permit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressProof" ADD CONSTRAINT "AddressProof_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityProof" ADD CONSTRAINT "IdentityProof_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permit" ADD CONSTRAINT "Permit_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadAccessUsers" ADD CONSTRAINT "ReadAccessUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadAccessUsers" ADD CONSTRAINT "ReadAccessUsers_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToOrganisation" ADD CONSTRAINT "_ImageToOrganisation_A_fkey" FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToOrganisation" ADD CONSTRAINT "_ImageToOrganisation_B_fkey" FOREIGN KEY ("B") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
