/*
  Warnings:

  - You are about to drop the column `loggedIn` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "loggedIn",
ADD COLUMN     "sessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_sessionId_key" ON "users"("sessionId");
