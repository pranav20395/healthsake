-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- CreateTable
CREATE TABLE "RazorpayReceipts" (
    "id" TEXT NOT NULL,
    "receipt" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RazorpayReceipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RazorpayReceipts" ADD CONSTRAINT "RazorpayReceipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
