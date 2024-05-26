-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('Read', 'Write', 'Admin');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('Admin', 'User', 'Developer');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "profile_picture" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "role" "Roles" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "device_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "role" "Roles" NOT NULL,
    "permission_type" "PermissionType" NOT NULL,
    "module" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_device_token_key" ON "users"("device_token");
