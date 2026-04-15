-- Prevent remaining_sessions from going below 0 at the DB layer
ALTER TABLE "memberships"
ADD CONSTRAINT "remaining_sessions_non_negative"
CHECK ("remaining_sessions" >= 0);

-- Also prevent used_sessions from being negative (defense in depth)
ALTER TABLE "memberships"
ADD CONSTRAINT "used_sessions_non_negative"
CHECK ("used_sessions" >= 0);