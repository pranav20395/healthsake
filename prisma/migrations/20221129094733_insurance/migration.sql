-- AlterTable
ALTER TABLE "InsuranceLogs" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';
