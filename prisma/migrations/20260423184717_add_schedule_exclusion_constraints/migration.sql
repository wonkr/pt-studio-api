-- Drop old constraint
ALTER TABLE "schedules"
DROP CONSTRAINT IF EXISTS no_schedule_overlap;

-- Trainer overlap prevention (conducted_by_trainer_id 기준)
ALTER TABLE "schedules"
  ADD CONSTRAINT schedules_trainer_no_overlap
  EXCLUDE USING GIST (
    conducted_by_trainer_id WITH =,
    tstzrange(scheduled_at, ends_at) WITH &&
  )
  WHERE (status NOT IN ('CANCELLED', 'NOSHOW'));

-- Room overlap prevention
ALTER TABLE "schedules"
  ADD CONSTRAINT schedules_room_no_overlap
  EXCLUDE USING GIST (
    room_id WITH =,
    tstzrange(scheduled_at, ends_at) WITH &&
  )
  WHERE (status NOT IN ('CANCELLED', 'NOSHOW'));