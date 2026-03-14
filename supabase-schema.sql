-- GM Automation — Full Database Schema (Supabase PostgreSQL)
-- Run via: psql or Supabase SQL editor

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts (core content)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  media_urls TEXT[],
  content_type TEXT DEFAULT 'post' CHECK (content_type IN ('post','carousel','reel','story')),
  platform TEXT NOT NULL CHECK (platform IN ('instagram','twitter','linkedin','threads','mastodon','bluesky')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','failed','cancelled')),
  external_post_id TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scheduled Posts (queue)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','published','failed','cancelled')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Post Analytics
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, platform)
);

-- 5. Carousel Slides
CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL,
  headline TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  template TEXT DEFAULT 'minimal-dark',
  bg_color TEXT,
  text_color TEXT,
  type TEXT DEFAULT 'value' CHECK (type IN ('hook','value','example','tip','cta')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content Drafts
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  raw_content TEXT,
  generated_variants JSONB DEFAULT '{}',
  tags TEXT[],
  niche TEXT DEFAULT 'automations-tech',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Social Accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','twitter','linkedin','threads','mastodon','bluesky')),
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, platform)
);

-- 8. Trending Topics (cache)
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  score INTEGER DEFAULT 0,
  category TEXT DEFAULT 'ai',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Cron Logs
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'success' CHECK (status IN ('success','partial','error')),
  posts_processed INTEGER DEFAULT 0,
  error_message TEXT,
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON trending_topics(category);
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON cron_logs(job_name);

-- ── Row Level Security (Enable in production) ─────────────────────────────────
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users see own posts" ON posts FOR ALL USING (auth.uid()::text = user_id::text);
