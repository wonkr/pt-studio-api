/*
  Warnings:

  - Added the required column `session_duration` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "session_duration" DECIMAL(65,30) NOT NULL;
