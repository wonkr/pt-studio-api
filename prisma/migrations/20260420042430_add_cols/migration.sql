/*
  Warnings:

  - Added the required column `deleted_at` to the `session_passes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session_passes" ADD COLUMN     "deleted_at" TIMESTAMP(3) NOT NULL;
