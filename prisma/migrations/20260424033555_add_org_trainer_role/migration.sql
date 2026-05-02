/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `trainers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone_number` to the `trainers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrgTrainerRole" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "trainers" ADD COLUMN     "phone_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "trainers_phone_number_key" ON "trainers"("phone_number");
