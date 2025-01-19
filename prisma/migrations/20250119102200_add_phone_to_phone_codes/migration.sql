/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `phone_code` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `phone_code` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "phone_code" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "phone_code_phone_key" ON "phone_code"("phone");
