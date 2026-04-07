/*
  Warnings:

  - Added the required column `valid_days` to the `session_passes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session_passes" ADD COLUMN     "valid_days" INTEGER NOT NULL;
