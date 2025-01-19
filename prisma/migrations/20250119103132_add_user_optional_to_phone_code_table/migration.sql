-- DropForeignKey
ALTER TABLE "phone_code" DROP CONSTRAINT "phone_code_userId_fkey";

-- AlterTable
ALTER TABLE "phone_code" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "phone_code" ADD CONSTRAINT "phone_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
