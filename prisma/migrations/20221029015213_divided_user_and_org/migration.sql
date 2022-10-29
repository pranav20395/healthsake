/*
  Warnings:

  - You are about to drop the column `orgId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - Made the column `role` on table `Organisation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expires" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "orgId",
DROP COLUMN "type",
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "fname" SET NOT NULL,
ALTER COLUMN "lname" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL;
