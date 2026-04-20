/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "deleted_at";
