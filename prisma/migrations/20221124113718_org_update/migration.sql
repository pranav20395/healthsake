/*
  Warnings:

  - You are about to drop the `_ImageToOrganisation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orgId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ImageToOrganisation" DROP CONSTRAINT "_ImageToOrganisation_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageToOrganisation" DROP CONSTRAINT "_ImageToOrganisation_B_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- DropTable
DROP TABLE "_ImageToOrganisation";

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
