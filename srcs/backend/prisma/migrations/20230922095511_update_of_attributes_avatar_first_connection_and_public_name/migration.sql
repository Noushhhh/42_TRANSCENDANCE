/*
  Warnings:

  - You are about to drop the column `firstConnection` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profileName` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicName]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_profileName_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "firstConnection",
DROP COLUMN "profileName",
ADD COLUMN     "firstConnexion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_publicName_key" ON "users"("publicName");
