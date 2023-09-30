-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userName_fkey";

-- DropIndex
DROP INDEX "RefreshToken_userName_key";
