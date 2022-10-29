/*
  Warnings:

  - Made the column `name` on table `Organisation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Organisation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Organisation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;
