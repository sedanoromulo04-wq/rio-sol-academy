-- Profiles table to store user gamification state
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  specialty TEXT,
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
  source_platform TEXT NOT NULL DEFAULT 'youtube',
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 1,
  video_count INTEGER NOT NULL DEFAULT 1,
  material_count INTEGER NOT NULL DEFAULT 1,
  assessment_question_count INTEGER NOT NULL DEFAULT 5,
  passing_score INTEGER NOT NULL DEFAULT 70,
  estimated_minutes_override INTEGER,
  audience_scope TEXT NOT NULL DEFAULT 'all',
  target_specialties TEXT[] NOT NULL DEFAULT '{}',
  automation_status TEXT NOT NULL DEFAULT 'not_configured',
  transcript_status TEXT NOT NULL DEFAULT 'idle',
  transcript_text TEXT NOT NULL DEFAULT '',
  summary_status TEXT NOT NULL DEFAULT 'idle',
  summary_text TEXT NOT NULL DEFAULT '',
  mind_map_status TEXT NOT NULL DEFAULT 'idle',
  mind_map_markdown TEXT NOT NULL DEFAULT '',
  assessment_suggestions TEXT[] NOT NULL DEFAULT '{}',
  automation_requested_at TIMESTAMP WITH TIME ZONE,
  automation_processed_at TIMESTAMP WITH TIME ZONE,
  automation_error TEXT
);

CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  due_at TIMESTAMP WITH TIME ZONE,
  watched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assessment_score INTEGER,
  assessment_status TEXT NOT NULL DEFAULT 'pending',
  attempts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, content_id)
);

CREATE TABLE user_content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, content_id)
);

CREATE TABLE backend_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content_id UUID REFERENCES content(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System Settings for global configurations
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_events ENABLE ROW LEVEL SECURITY;

-- Simple security policies
CREATE POLICY "Allow read access to everyone" ON content FOR SELECT USING (true);
CREATE POLICY "Allow write access to admins" ON content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Allow read settings to everyone" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Allow write settings to admins" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can read own learning progress" ON learning_progress FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert own learning progress" ON learning_progress FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own learning progress" ON learning_progress FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Admins can read all learning progress" ON learning_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can read own content access" ON user_content_access FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Admins can manage content access" ON user_content_access FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can read own backend events" ON backend_events FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert own backend events" ON backend_events FOR INSERT WITH CHECK (
  auth.uid() = user_id AND auth.uid() = actor_id
);
CREATE POLICY "Admins can read all backend events" ON backend_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can insert backend events" ON backend_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
