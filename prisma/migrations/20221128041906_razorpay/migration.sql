-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- AlterTable
ALTER TABLE "RazorpayReceipts" ADD COLUMN     "verify" BOOLEAN NOT NULL DEFAULT false;
