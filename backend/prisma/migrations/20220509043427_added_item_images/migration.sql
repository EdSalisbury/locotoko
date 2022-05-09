-- CreateTable
CREATE TABLE "itemImages" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "itemImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itemImages" ADD CONSTRAINT "itemImages_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
