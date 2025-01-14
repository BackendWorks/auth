/*
  Warnings:

  - Made the column `inn` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ogrn` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `legalAddress` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentUrl` on table `companies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "inn" SET NOT NULL,
ALTER COLUMN "ogrn" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "legalAddress" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "documentUrl" SET NOT NULL;
