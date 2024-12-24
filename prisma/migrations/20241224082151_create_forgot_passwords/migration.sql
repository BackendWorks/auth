-- CreateTable
CREATE TABLE "forgot_passwords" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "firstUsed" BOOLEAN NOT NULL DEFAULT false,
    "finalUsed" BOOLEAN NOT NULL DEFAULT false,
    "expires" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forgot_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_passwords_email_key" ON "forgot_passwords"("email");
