/*
  Warnings:

  - A unique constraint covering the columns `[publicName]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "publicName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_publicName_key" ON "users"("publicName");
