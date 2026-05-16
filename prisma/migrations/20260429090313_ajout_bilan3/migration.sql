/*
  Warnings:

  - You are about to drop the `Questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Questions";

-- CreateTable
CREATE TABLE "Bilan" (
    "bilan" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "by_email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isbilan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bilan_pkey" PRIMARY KEY ("id")
);
