/*
  Warnings:

  - You are about to drop the column `userEmail` on the `OneTimeToken` table. All the data in the column will be lost.
  - Added the required column `userId` to the `OneTimeToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OneTimeToken" DROP CONSTRAINT "OneTimeToken_userEmail_fkey";

-- AlterTable
ALTER TABLE "OneTimeToken" DROP COLUMN "userEmail",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AddForeignKey
ALTER TABLE "OneTimeToken" ADD CONSTRAINT "OneTimeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
