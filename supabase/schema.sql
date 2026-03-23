-- Profiles table to store user gamification state
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  xp_total INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT false
);

-- Activities table to track individual learning events
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content table for CMS
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT
);

-- System Settings for global configurations
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Simple security policies
CREATE POLICY "Allow read access to everyone" ON content FOR SELECT USING (true);
CREATE POLICY "Allow write access to admins" ON content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow read settings to everyone" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow write settings to admins" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
