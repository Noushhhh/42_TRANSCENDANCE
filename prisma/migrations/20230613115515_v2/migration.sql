/*
  Warnings:

  - You are about to drop the column `hash` on the `User` table. All the data in the column will be lost.
  - Added the required column `hashPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `login` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hash",
ADD COLUMN     "hashPassword" TEXT NOT NULL,
ALTER COLUMN "login" SET NOT NULL;
