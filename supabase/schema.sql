-- AlumConnect Supabase Schema
-- Run this in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE introduction_status AS ENUM ('student', 'employed', 'entrepreneur', 'graduate_student', 'other');
CREATE TYPE contact_preference AS ENUM ('email', 'linkedin', 'phone', 'kakao');
CREATE TYPE looking_for AS ENUM ('mentoring', 'networking', 'collaboration', 'job_opportunities', 'investment');
CREATE TYPE question_type AS ENUM ('basic', 'facility', 'culture', 'class_specific');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  graduation_class INTEGER NOT NULL CHECK (graduation_class >= 1 AND graduation_class <= 99),
  status user_status NOT NULL DEFAULT 'pending',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- Alumni database (for matching during registration)
CREATE TABLE alumni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  graduation_class INTEGER NOT NULL CHECK (graduation_class >= 1 AND graduation_class <= 99),
  birth_year INTEGER,
  is_registered BOOLEAN NOT NULL DEFAULT FALSE
);

-- Introduction profiles
CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  graduation_class INTEGER NOT NULL,
  status introduction_status NOT NULL,
  field TEXT,
  organization TEXT,
  location TEXT,
  self_introduction TEXT NOT NULL,
  looking_for looking_for,
  interests TEXT,
  expertise TEXT,
  projects TEXT,
  contact_preference contact_preference,
  contact_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type question_type NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0),
  difficulty difficulty NOT NULL,
  applicable_class_from INTEGER,
  applicable_class_to INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz sessions (temporary, for registration flow)
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  alumni_id UUID REFERENCES alumni(id),
  alumni_matched BOOLEAN NOT NULL DEFAULT FALSE,
  question_ids UUID[] NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_alumni_name_class ON alumni(name, graduation_class);
CREATE INDEX idx_introductions_user_id ON introductions(user_id);
CREATE INDEX idx_introductions_graduation_class ON introductions(graduation_class);
CREATE INDEX idx_quiz_sessions_email ON quiz_sessions(email);
CREATE INDEX idx_quiz_sessions_expires_at ON quiz_sessions(expires_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Alumni policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view alumni" ON alumni
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage alumni" ON alumni
  FOR ALL USING (auth.role() = 'service_role');

-- Introductions policies
CREATE POLICY "Anyone can view introductions" ON introductions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own introductions" ON introductions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage introductions" ON introductions
  FOR ALL USING (auth.role() = 'service_role');

-- Quiz questions policies
CREATE POLICY "Service role can manage quiz questions" ON quiz_questions
  FOR ALL USING (auth.role() = 'service_role');

-- Quiz sessions policies
CREATE POLICY "Service role can manage quiz sessions" ON quiz_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_introductions_updated_at
  BEFORE UPDATE ON introductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - Quiz Questions)
-- ============================================

-- Insert sample quiz questions (uncomment to use)
/*
INSERT INTO quiz_questions (type, question, options, correct_index, difficulty) VALUES
  ('school_life', '인천과학고의 교훈은 무엇인가요?', ARRAY['창의', '성실', '봉사', '탐구'], 0, 'easy'),
  ('facility', '학교 본관 건물의 층수는?', ARRAY['3층', '4층', '5층', '6층'], 2, 'easy'),
  ('event', '매년 가을에 열리는 학교 축제의 이름은?', ARRAY['과학제', '청람제', '백합제', '한마음제'], 1, 'medium');
*/
