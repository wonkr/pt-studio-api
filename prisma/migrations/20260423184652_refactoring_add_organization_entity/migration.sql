/*
  Warnings:

  - You are about to drop the column `trainer_id` on the `revenue_recognitions` table. All the data in the column will be lost.
  - You are about to drop the column `trainer_id` on the `schedules` table. All the data in the column will be lost.
  - You are about to alter the column `session_duration` on the `schedules` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the column `trainer_id` on the `session_passes` table. All the data in the column will be lost.
  - You are about to drop the `refresh_token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trainer_expenses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organization_id,name,phone_number,deleted_at]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,name]` on the table `session_passes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_pass_name` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_pass_price` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_pass_total_sessions` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_pass_valid_days` to the `memberships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conducted_by_trainer_id` to the `revenue_recognitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `revenue_recognitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conducted_by_trainer_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_trainer_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `session_passes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrgTrainerRole" AS ENUM ('ADMIN', 'TRAINER');

-- CreateEnum
CREATE TYPE "OrgTrainerStatus" AS ENUM ('PENDING', 'APPROVED');

-- DropForeignKey
ALTER TABLE "refresh_token" DROP CONSTRAINT "refresh_token_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "revenue_recognitions" DROP CONSTRAINT "revenue_recognitions_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "session_passes" DROP CONSTRAINT "session_passes_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "trainer_expenses" DROP CONSTRAINT "trainer_expenses_trainer_id_fkey";

-- DropIndex
DROP INDEX "members_trainer_id_name_phone_number_deleted_at_key";

-- DropIndex
DROP INDEX "session_passes_trainer_id_name_key";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "organization_id" TEXT NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "session_pass_name" TEXT NOT NULL,
ADD COLUMN     "session_pass_price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "session_pass_total_sessions" INTEGER NOT NULL,
ADD COLUMN     "session_pass_valid_days" INTEGER NOT NULL,
ALTER COLUMN "paid_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "started_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "expired_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "revenue_recognitions" DROP COLUMN "trainer_id",
ADD COLUMN     "conducted_by_trainer_id" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ALTER COLUMN "recognized_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "trainer_id",
ADD COLUMN     "conducted_by_trainer_id" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "primary_trainer_id" TEXT NOT NULL,
ADD COLUMN     "room_id" TEXT NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "scheduled_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "session_duration" SET DATA TYPE INTEGER,
ALTER COLUMN "ends_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "session_passes" DROP COLUMN "trainer_id",
ADD COLUMN     "organization_id" TEXT NOT NULL,
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "trainers" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ;

-- DropTable
DROP TABLE "refresh_token";

-- DropTable
DROP TABLE "trainer_expenses";

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "room_count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_trainers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "role" "OrgTrainerRole" NOT NULL,
    "status" "OrgTrainerStatus" NOT NULL,
    "payout_per_session" DECIMAL(65,30),
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_expenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_by_trainer_id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "memo" TEXT,
    "paid_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_address_key" ON "organizations"("name", "address");

-- CreateIndex
CREATE UNIQUE INDEX "organization_trainers_organization_id_trainer_id_key" ON "organization_trainers"("organization_id", "trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_organization_id_name_key" ON "rooms"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "members_organization_id_name_phone_number_deleted_at_key" ON "members"("organization_id", "name", "phone_number", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "session_passes_organization_id_name_key" ON "session_passes"("organization_id", "name");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_trainers" ADD CONSTRAINT "organization_trainers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_trainers" ADD CONSTRAINT "organization_trainers_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_expenses" ADD CONSTRAINT "org_expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_expenses" ADD CONSTRAINT "org_expenses_created_by_trainer_id_fkey" FOREIGN KEY ("created_by_trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_passes" ADD CONSTRAINT "session_passes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_primary_trainer_id_fkey" FOREIGN KEY ("primary_trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_conducted_by_trainer_id_fkey" FOREIGN KEY ("conducted_by_trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognitions" ADD CONSTRAINT "revenue_recognitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognitions" ADD CONSTRAINT "revenue_recognitions_conducted_by_trainer_id_fkey" FOREIGN KEY ("conducted_by_trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
