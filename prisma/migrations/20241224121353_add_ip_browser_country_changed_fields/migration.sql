-- AlterTable
ALTER TABLE "forgot_passwords" ADD COLUMN     "browserChanged" TEXT,
ADD COLUMN     "countryChanged" TEXT,
ADD COLUMN     "ipChanged" TEXT;
