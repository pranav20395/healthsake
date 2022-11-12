/*
  Warnings:

  - Added the required column `userEmail` to the `OneTimeToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OneTimeToken" DROP CONSTRAINT "OneTimeToken_userId_fkey";

-- AlterTable
ALTER TABLE "OneTimeToken" ADD COLUMN     "userEmail" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes',
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OneTimeToken" ADD CONSTRAINT "OneTimeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
