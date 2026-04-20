/*
  Warnings:

  - A unique constraint covering the columns `[trainer_id,name,phone_number,deleted_at]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "members_trainer_id_name_phone_number_key";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "members_trainer_id_name_phone_number_deleted_at_key" ON "members"("trainer_id", "name", "phone_number", "deleted_at");
