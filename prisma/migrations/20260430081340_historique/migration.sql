-- CreateTable
CREATE TABLE "Questions" (
    "question" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "by_email" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);
