-- CreateTable
CREATE TABLE "ebayCategories" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL,

    CONSTRAINT "ebayCategories_pkey" PRIMARY KEY ("id")
);
