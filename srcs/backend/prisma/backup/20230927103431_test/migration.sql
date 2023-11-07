/*
  Warnings:

  - You are about to drop the column `twoFASecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFAUrl` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "twoFASecret",
DROP COLUMN "twoFAUrl";
