-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';
