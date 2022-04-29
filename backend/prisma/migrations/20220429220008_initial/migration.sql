-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "soldDate" TIMESTAMP(3),
    "shippedDate" TIMESTAMP(3),
    "listingAgentId" TEXT NOT NULL,
    "shippingAgentId" TEXT,
    "quantity" INTEGER NOT NULL,
    "weightPounds" INTEGER,
    "weightOunces" INTEGER,
    "shipWeightPounds" INTEGER,
    "shipWeightOunces" INTEGER,
    "sizeHeightInches" INTEGER,
    "sizeWidthInches" INTEGER,
    "sizeDepthInches" INTEGER,
    "shipSizeHeightInches" INTEGER,
    "shipSizeWidthInches" INTEGER,
    "shipSizeDepthInches" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
