-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';
