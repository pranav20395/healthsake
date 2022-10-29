/*
  Warnings:

  - You are about to drop the column `organisationId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `fname` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `lname` on the `Individual` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `organisationId` on the `Session` table. All the data in the column will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_organisationId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "organisationId";

-- AlterTable
ALTER TABLE "Individual" DROP COLUMN "fname",
DROP COLUMN "lname";

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expires" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "organisationId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL;
