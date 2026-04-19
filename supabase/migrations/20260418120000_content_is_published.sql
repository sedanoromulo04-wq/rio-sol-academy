-- Add is_published flag to content table
-- Admin must explicitly publish content to make it visible to learners

ALTER TABLE content
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

-- Existing content that already has a youtube video and ready status = auto-publish
UPDATE content SET is_published = true
WHERE automation_status = 'ready';
