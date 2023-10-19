-- AlterTable
ALTER TABLE "MatchHistory" ADD COLUMN     "opponentLeft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playerLeft" BOOLEAN NOT NULL DEFAULT false;
