-- Newsletter status enum
CREATE TYPE newsletter_status AS ENUM ('draft', 'published')

-- Section type enum
CREATE TYPE section_type AS ENUM ('alumni_in_media', 'member_announcements', 'industry_trends')

-- Newsletters table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status newsletter_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Newsletter sections table
CREATE TABLE newsletter_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  type section_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Indexes
CREATE INDEX idx_newsletters_edition ON newsletters(edition);
CREATE INDEX idx_newsletters_status ON newsletters(status);
CREATE INDEX idx_newsletter_sections_newsletter_id ON newsletter_sections(newsletter_id);

-- RLS
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY
ALTER TABLE newsletter_sections ENABLE ROW LEVEL SECURITY

-- Public can read published newsletters
CREATE POLICY "Public can read published newsletters" ON newsletters
  FOR SELECT USING (status = 'published')

-- Admin can manage all newsletters (service role)
CREATE POLICY "Service role full access newsletters" ON newsletters
  FOR ALL USING (auth.role() = 'service_role')

-- Public can read sections of published newsletters
CREATE POLICY "Public can read published sections" ON newsletter_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = newsletter_sections.newsletter_id
      AND newsletters.status = 'published'
    )
  )

-- Service role full access to sections
CREATE POLICY "Service role full access sections" ON newsletter_sections
  FOR ALL USING (auth.role() = 'service_role')
