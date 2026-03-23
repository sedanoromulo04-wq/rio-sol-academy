-- =======================================================================
-- RIO SOL Academy - Migração Completa do Schema
-- Versão: 1.0 | Data: 2026-03-23
-- =======================================================================
-- Este SQL deve ser executado no SQL Editor do Supabase Dashboard:
-- https://supabase.com/dashboard/project/ufzzvdvhijvlmnemygoj/sql/new
-- =======================================================================

-- =====================
-- 1. TABELAS
-- =====================

-- Profiles: dados do usuário vinculados ao auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  xp_total INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities: histórico de ações para cálculo de XP
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content: trilhas e lições do CMS
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings: configurações globais (chave-valor)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- =====================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_total ON public.profiles(xp_total DESC);

-- =====================
-- 3. TRIGGER: AUTO-CRIAR PERFIL PARA NOVO USUÁRIO
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- ACTIVITIES ----
DROP POLICY IF EXISTS "Users can read own activities" ON public.activities;
CREATE POLICY "Users can read own activities"
  ON public.activities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all activities" ON public.activities;
CREATE POLICY "Admins can read all activities"
  ON public.activities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ---- CONTENT ----
DROP POLICY IF EXISTS "Anyone can read content" ON public.content;
CREATE POLICY "Anyone can read content"
  ON public.content FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
CREATE POLICY "Admins can manage content"
  ON public.content FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- ---- SYSTEM SETTINGS ----
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings"
  ON public.system_settings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- =====================
-- 5. DADOS SEED - CONTEÚDO
-- =====================
INSERT INTO public.content (id, title, description, video_url, thumbnail_url, category) VALUES
  ('c1000000-0000-0000-0000-000000000001',
   'Filosofia & Ética Solar',
   'Mergulhe nas raízes filosóficas da transição energética. Entenda como a ética solar molda nossas interações comerciais e fortalece o propósito por trás de cada sistema.',
   'https://youtube.com',
   'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
   'Cultura'),
  ('c2000000-0000-0000-0000-000000000002',
   'Engenharia Fotovoltaica Essencial',
   'Domine os princípios físicos e elétricos dos sistemas solares. De inversores string a microinversores, construa a base técnica necessária para dimensionar soluções.',
   'https://youtube.com',
   'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&h=400&fit=crop',
   'Técnico'),
  ('c3000000-0000-0000-0000-000000000003',
   'A Arquitetura da Persuasão',
   'Desvende os gatilhos mentais e as heurísticas de decisão dos clientes. Aprenda a estruturar narrativas comerciais irrefutáveis e dominar a escuta ativa.',
   'https://youtube.com',
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
   'Psicologia')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- 6. DADOS SEED - CONFIGURAÇÕES
-- =====================
INSERT INTO public.system_settings (key, value) VALUES
  ('streak_enabled', 'true'),
  ('weekly_focus', 'Foco em resiliência e objeções financeiras. Apresentar o Payback corretamente.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =====================
-- 7. CRIAÇÃO DO USUÁRIO ADMIN
-- =====================
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lucas.salles@riosolenergias.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'lucas.salles@riosolenergias.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Lucas Salles (Admin)"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    UPDATE public.profiles SET is_admin = true WHERE id = new_user_id;
  END IF;
END $$;

-- =======================================================================
-- FIM DA MIGRAÇÃO
-- =======================================================================
