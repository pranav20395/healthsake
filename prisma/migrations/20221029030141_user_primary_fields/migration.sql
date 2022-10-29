-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expires" SET DEFAULT NOW() + interval '2 minutes';
