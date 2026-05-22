-- CreateTable
CREATE TABLE "CollaborationRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxMembers" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tier" TEXT NOT NULL DEFAULT 'pro',

    CONSTRAINT "CollaborationRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationMember" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT,
    "content" TEXT NOT NULL,
    "isAi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CollaborationMember" ADD CONSTRAINT "CollaborationMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationMessage" ADD CONSTRAINT "CollaborationMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollaborationRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
