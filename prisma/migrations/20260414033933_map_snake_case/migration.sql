/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `scheduled_at` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "scheduledAt",
ADD COLUMN     "scheduled_at" TIMESTAMP(3) NOT NULL;
