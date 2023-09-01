/*
  Warnings:

  - A unique constraint covering the columns `[profileName]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profileName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_profileName_key" ON "users"("profileName");
