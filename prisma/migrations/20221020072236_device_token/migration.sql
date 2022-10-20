/*
  Warnings:

  - A unique constraint covering the columns `[deviceToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiredAt` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceToken_key" ON "User"("deviceToken");
