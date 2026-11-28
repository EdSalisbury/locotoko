-- AlterTable
ALTER TABLE "items" ADD COLUMN     "identifyError" TEXT,
ADD COLUMN     "identifyNotes" TEXT,
ADD COLUMN     "identifyStatus" TEXT,
ADD COLUMN     "lucidaItemNumber" TEXT;

-- CreateTable
CREATE TABLE "apiKeys" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "apiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apiKeys_hash_key" ON "apiKeys"("hash");

-- CreateIndex
CREATE INDEX "items_lucidaItemNumber_idx" ON "items"("lucidaItemNumber");

-- AddForeignKey
ALTER TABLE "apiKeys" ADD CONSTRAINT "apiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
