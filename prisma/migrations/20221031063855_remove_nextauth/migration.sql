/*
  Warnings:

  - You are about to drop the column `email` on the `OneTimeToken` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `OneTimeToken` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `OneTimeToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- AlterTable
ALTER TABLE "OneTimeToken" DROP COLUMN "email",
DROP COLUMN "expires",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '2 minutes',
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Example";

-- AddForeignKey
ALTER TABLE "OneTimeToken" ADD CONSTRAINT "OneTimeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
