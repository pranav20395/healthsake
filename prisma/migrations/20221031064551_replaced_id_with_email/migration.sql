/*
  Warnings:

  - You are about to drop the column `userId` on the `OneTimeToken` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `OneTimeToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OneTimeToken" DROP CONSTRAINT "OneTimeToken_userId_fkey";

-- AlterTable
ALTER TABLE "OneTimeToken" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AddForeignKey
ALTER TABLE "OneTimeToken" ADD CONSTRAINT "OneTimeToken_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
