/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userName` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userName_key" ON "RefreshToken"("userName");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userName_fkey" FOREIGN KEY ("userName") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
