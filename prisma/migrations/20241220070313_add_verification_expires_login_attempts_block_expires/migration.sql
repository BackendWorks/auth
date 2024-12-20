-- AlterTable
ALTER TABLE "users" ADD COLUMN     "block_expires" TIMESTAMP(3),
ADD COLUMN     "login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ALTER COLUMN "verification" DROP NOT NULL;
