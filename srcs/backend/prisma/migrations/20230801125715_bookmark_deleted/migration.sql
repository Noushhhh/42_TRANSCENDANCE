/*
  Warnings:

  - You are about to drop the column `profilePic` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "profilePic",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "gamesLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "playTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rank" INTEGER;

-- DropTable
DROP TABLE "Bookmark";
