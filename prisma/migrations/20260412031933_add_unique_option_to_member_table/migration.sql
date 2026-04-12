/*
  Warnings:

  - A unique constraint covering the columns `[trainer_id,name,phone_number]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "members_trainer_id_name_phone_number_key" ON "members"("trainer_id", "name", "phone_number");
