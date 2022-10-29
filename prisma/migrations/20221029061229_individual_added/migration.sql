/*
  Warnings:

  - You are about to drop the column `email` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `organisationVerified` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `healthLicense` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `identity` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Organisation_email_key";

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expires" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "email",
DROP COLUMN "organisationVerified",
DROP COLUMN "password";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "fname",
DROP COLUMN "healthLicense",
DROP COLUMN "identity",
DROP COLUMN "image",
DROP COLUMN "lname",
DROP COLUMN "role",
ADD COLUMN     "indID" TEXT,
ADD COLUMN     "orgId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateTable
CREATE TABLE "Individual" (
    "id" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "image" TEXT,
    "identity" TEXT,
    "address" TEXT,
    "healthLicense" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',

    CONSTRAINT "Individual_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_indID_fkey" FOREIGN KEY ("indID") REFERENCES "Individual"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
