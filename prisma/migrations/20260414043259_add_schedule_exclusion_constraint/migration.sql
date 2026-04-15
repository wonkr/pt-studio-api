-- btree_gist extension is required
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add Exclusion Constraint
ALTER TABLE "schedules"
ADD CONSTRAINT no_schedule_overlap
EXCLUDE USING gist (
  "trainer_id" WITH =,
  tsrange("scheduled_at", "ends_at", '[)') WITH &&
) WHERE (status IN ('SCHEDULED', 'ATTENDED'));