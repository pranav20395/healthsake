/*
  Warnings:

  - The `purpose` column on the `Bill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Individual` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `Organisation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "purpose",
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'CONSULTATION';

-- AlterTable
ALTER TABLE "Individual" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PATIENT';

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'HOSPITAL';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'CREATED';

-- DropEnum
DROP TYPE "BillPurpose";

-- DropEnum
DROP TYPE "IndividualRole";

-- DropEnum
DROP TYPE "OrgRole";

-- DropEnum
DROP TYPE "UserStatus";

-- DropEnum
DROP TYPE "UserTypes";
