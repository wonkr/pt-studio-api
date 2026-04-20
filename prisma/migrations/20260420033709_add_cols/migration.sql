-- AlterTable
ALTER TABLE "members" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "session_passes" ADD COLUMN     "is_activated" BOOLEAN NOT NULL DEFAULT true;
