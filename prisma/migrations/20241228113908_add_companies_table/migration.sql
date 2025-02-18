-- CreateEnum
CREATE TYPE "CompanyVerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "directorFirstName" TEXT NOT NULL,
    "directorLastName" TEXT NOT NULL,
    "directorPatronymic" TEXT,
    "inn" TEXT,
    "ogrn" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "legalAddress" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "documentUrl" TEXT,
    "status" "CompanyVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
