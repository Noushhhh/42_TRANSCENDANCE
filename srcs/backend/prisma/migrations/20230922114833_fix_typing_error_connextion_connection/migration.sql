/*
  Warnings:

  - You are about to drop the column `firstConnexion` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "firstConnexion",
ADD COLUMN     "firstConnetion" BOOLEAN NOT NULL DEFAULT true;
