/*
  Warnings:

  - You are about to drop the column `login` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_login_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "login",
ADD COLUMN     "firstConnexion" BOOLEAN NOT NULL DEFAULT true;
