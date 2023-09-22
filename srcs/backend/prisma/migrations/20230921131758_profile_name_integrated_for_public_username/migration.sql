/*
  Warnings:

  - You are about to drop the column `login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `users` table. All the data in the column will be lost.
  - Made the column `profileName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_login_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "login",
DROP COLUMN "profileImageUrl",
ADD COLUMN     "firstConnection" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "profileName" SET NOT NULL;
