/*
  Warnings:

  - You are about to drop the `_MutedUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MutedUsers" DROP CONSTRAINT "_MutedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_MutedUsers" DROP CONSTRAINT "_MutedUsers_B_fkey";

-- DropTable
DROP TABLE "_MutedUsers";

-- CreateTable
CREATE TABLE "MutedUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "mutedUntil" TIMESTAMP(3),

    CONSTRAINT "MutedUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MutedUser" ADD CONSTRAINT "MutedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutedUser" ADD CONSTRAINT "MutedUser_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
