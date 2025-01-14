/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_company" DROP CONSTRAINT "user_company_companyId_fkey";

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "directorFirstName" TEXT NOT NULL,
    "directorLastName" TEXT NOT NULL,
    "directorPatronymic" TEXT NOT NULL,
    "inn" TEXT,
    "ogrn" TEXT,
    "organizationName" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "legalAddress" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "documentUrl" TEXT,
    "logoUrl" TEXT,
    "status" "CompanyVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_company" ADD CONSTRAINT "user_company_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
