/*
  Warnings:

  - You are about to drop the column `firstConnetion` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "firstConnetion",
ADD COLUMN     "firstConnection" BOOLEAN NOT NULL DEFAULT true;
