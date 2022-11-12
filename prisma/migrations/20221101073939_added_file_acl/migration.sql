-- AlterTable
ALTER TABLE "OneTimeToken" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + interval '2 minutes';

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileStorage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
