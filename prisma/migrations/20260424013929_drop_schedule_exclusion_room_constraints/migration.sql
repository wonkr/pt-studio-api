-- Drop old constraint
ALTER TABLE "schedules"
DROP CONSTRAINT IF EXISTS no_schedule_overlap;