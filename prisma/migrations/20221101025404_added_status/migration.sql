-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'CREATED';
