-- AlterTable
ALTER TABLE "FileStorage" ADD COLUMN     "hash" TEXT;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';
