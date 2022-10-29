/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `OneTimeToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OneTimeToken" DROP COLUMN "updatedAt",
ALTER COLUMN "expires" SET DEFAULT NOW() + interval '2 minutes';
