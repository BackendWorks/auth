-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "expiredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profilePicture" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "deviceToken" DROP NOT NULL;
