-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" MONEY NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
