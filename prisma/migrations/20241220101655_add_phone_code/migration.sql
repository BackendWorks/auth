-- CreateTable
CREATE TABLE "PhoneCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneCodeHash" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhoneCode" ADD CONSTRAINT "PhoneCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
