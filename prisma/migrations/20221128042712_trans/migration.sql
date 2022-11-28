-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;
