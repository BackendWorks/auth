/*
  Warnings:

  - Added the required column `fileId` to the `company_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company_documents" ADD COLUMN     "fileId" TEXT NOT NULL;
