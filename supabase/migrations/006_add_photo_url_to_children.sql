-- Add photo_url column to children for storing selfie/avatar image
-- Stored as base64 data URL (e.g. "data:image/jpeg;base64,...") or external URL
ALTER TABLE children ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;
