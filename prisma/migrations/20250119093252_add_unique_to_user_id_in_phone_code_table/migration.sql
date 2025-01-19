/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `phone_code` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "phone_code_userId_key" ON "phone_code"("userId");
