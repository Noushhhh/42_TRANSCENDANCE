/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "_Admins" DROP CONSTRAINT "_Admins_B_fkey";

-- DropForeignKey
ALTER TABLE "_BannedUsers" DROP CONSTRAINT "_BannedUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_BlockedUsers" DROP CONSTRAINT "_BlockedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_BlockedUsers" DROP CONSTRAINT "_BlockedUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_MutedUsers" DROP CONSTRAINT "_MutedUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_Participant" DROP CONSTRAINT "_Participant_B_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockedUsers" ADD CONSTRAINT "_BlockedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Admins" ADD CONSTRAINT "_Admins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participant" ADD CONSTRAINT "_Participant_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BannedUsers" ADD CONSTRAINT "_BannedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MutedUsers" ADD CONSTRAINT "_MutedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
