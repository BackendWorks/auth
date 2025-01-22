/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_company" DROP CONSTRAINT "user_company_companyId_fkey";

-- DropForeignKey
ALTER TABLE "user_company" DROP CONSTRAINT "user_company_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "user_company";

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "directorFirstName" TEXT NOT NULL,
    "directorLastName" TEXT NOT NULL,
    "directorPatronymic" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "ogrn" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "legalAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "status" "CompanyVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
