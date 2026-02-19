-- Profiles table linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  graduation_class INTEGER NOT NULL CHECK (graduation_class >= 1 AND graduation_class <= 99),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  alumni_id UUID REFERENCES alumni(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_alumni_id ON profiles(alumni_id);
CREATE INDEX idx_profiles_graduation_class ON profiles(graduation_class);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id)

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)

-- Users can insert their own profile (during onboarding)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id)

-- Service role has full access
CREATE POLICY "Service role full access" ON profiles
  FOR ALL USING (auth.role() = 'service_role')

-- Authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL)
