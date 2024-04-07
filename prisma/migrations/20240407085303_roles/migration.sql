/*
  Warnings:

  - You are about to drop the column `is_enabled` on the `Permissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Permissions" DROP COLUMN "is_enabled";
