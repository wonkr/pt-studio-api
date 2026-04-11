/*
  Warnings:

  - The values [CANCELED,COMPLETED] on the enum `ScheduleStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attendance_id` on the `revenue_recognitions` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the `attendances` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[schedule_id]` on the table `revenue_recognitions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schedule_id` to the `revenue_recognitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membership_id` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledAt` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScheduleStatus_new" AS ENUM ('SCHEDULED', 'ATTENDED', 'CANCELLED', 'NOSHOW');
ALTER TABLE "schedules" ALTER COLUMN "status" TYPE "ScheduleStatus_new" USING ("status"::text::"ScheduleStatus_new");
ALTER TYPE "ScheduleStatus" RENAME TO "ScheduleStatus_old";
ALTER TYPE "ScheduleStatus_new" RENAME TO "ScheduleStatus";
DROP TYPE "public"."ScheduleStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_member_id_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "revenue_recognitions" DROP CONSTRAINT "revenue_recognitions_attendance_id_fkey";

-- DropIndex
DROP INDEX "revenue_recognitions_attendance_id_key";

-- AlterTable
ALTER TABLE "revenue_recognitions" DROP COLUMN "attendance_id",
ADD COLUMN     "schedule_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "time",
ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "membership_id" TEXT NOT NULL,
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "attendances";

-- CreateIndex
CREATE UNIQUE INDEX "revenue_recognitions_schedule_id_key" ON "revenue_recognitions"("schedule_id");

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognitions" ADD CONSTRAINT "revenue_recognitions_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
