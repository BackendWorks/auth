/*
  Warnings:

  - You are about to drop the `PhoneCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PhoneCode" DROP CONSTRAINT "PhoneCode_userId_fkey";

-- DropTable
DROP TABLE "PhoneCode";

-- CreateTable
CREATE TABLE "phone_code" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneCodeHash" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phone_code" ADD CONSTRAINT "phone_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
