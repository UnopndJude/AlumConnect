-- Announcement status enum
CREATE TYPE announcement_status AS ENUM ('pending', 'approved', 'rejected')

-- Announcement type enum (reuses section_type for consistency)
-- Note: section_type already exists from 003_newsletter.sql

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type section_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status announcement_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Indexes
CREATE INDEX idx_announcements_author_id ON announcements(author_id)
CREATE INDEX idx_announcements_status ON announcements(status)
CREATE INDEX idx_announcements_type ON announcements(type)
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC)

-- RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY

-- Users can view their own announcements
CREATE POLICY "Users can view own announcements" ON announcements
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = announcements.author_id
    )
  )

-- Users can create announcements (linked to their profile)
CREATE POLICY "Users can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = announcements.author_id
    )
  )

-- Users can update their own pending announcements
CREATE POLICY "Users can update own pending announcements" ON announcements
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = announcements.author_id
    )
    AND status = 'pending'
  )

-- Users can delete their own announcements
CREATE POLICY "Users can delete own announcements" ON announcements
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = announcements.author_id
    )
  )

-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements" ON announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )

-- Admins can update all announcements (for approval/rejection)
CREATE POLICY "Admins can update all announcements" ON announcements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )

-- Service role full access
CREATE POLICY "Service role full access announcements" ON announcements
  FOR ALL USING (auth.role() = 'service_role')
