-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "role" SET DEFAULT 'HOSPITAL';

-- CreateTable
CREATE TABLE "OneTimeToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '2 minutes',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneTimeToken_pkey" PRIMARY KEY ("id")
);
