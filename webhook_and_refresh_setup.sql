-- Webhook Management and Refresh Rate Configuration
-- Run this in your Supabase SQL Editor

-- 1. Create webhooks table for storing Slack webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'slack' CHECK (type IN ('slack', 'discord', 'webhook')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create refresh settings table
CREATE TABLE IF NOT EXISTS refresh_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 30 CHECK (refresh_interval_seconds IN (10, 30)),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Add webhook_id to rules table
ALTER TABLE rules ADD COLUMN IF NOT EXISTS webhook_id UUID REFERENCES webhooks(id) ON DELETE SET NULL;

-- 4. Enable RLS on new tables
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for webhooks
CREATE POLICY "Users can view their own webhooks" ON webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webhooks" ON webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks" ON webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks" ON webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for refresh_settings
CREATE POLICY "Users can view their own refresh settings" ON refresh_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own refresh settings" ON refresh_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own refresh settings" ON refresh_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_type ON webhooks(type);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_settings_user_id ON refresh_settings(user_id);

-- 8. Create trigger for updated_at on webhooks
CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Create trigger for updated_at on refresh_settings
CREATE TRIGGER update_refresh_settings_updated_at
    BEFORE UPDATE ON refresh_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function to validate webhook URLs
CREATE OR REPLACE FUNCTION validate_webhook_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic URL validation for Slack webhooks
  IF NEW.type = 'slack' AND NOT (NEW.url LIKE 'https://hooks.slack.com/%' OR NEW.url LIKE 'https://%') THEN
    RAISE EXCEPTION 'Invalid Slack webhook URL. Must start with https://hooks.slack.com/ or https://';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for webhook URL validation
CREATE TRIGGER validate_webhook_url_trigger
    BEFORE INSERT OR UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION validate_webhook_url();

-- 12. Create view for webhooks with user info
CREATE OR REPLACE VIEW user_webhooks AS
SELECT 
  w.id,
  w.name,
  w.url,
  w.type,
  w.is_active,
  w.created_at,
  w.updated_at,
  u.email as user_email
FROM webhooks w
JOIN auth.users u ON w.user_id = u.id
WHERE w.user_id = auth.uid();

-- 13. Insert default refresh setting for existing users
INSERT INTO refresh_settings (user_id, refresh_interval_seconds, is_active)
SELECT 
  id as user_id,
  30 as refresh_interval_seconds,
  true as is_active
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM refresh_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 14. Create function to get user's active refresh interval
CREATE OR REPLACE FUNCTION get_user_refresh_interval(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  interval_seconds INTEGER;
BEGIN
  SELECT refresh_interval_seconds INTO interval_seconds
  FROM refresh_settings
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(interval_seconds, 30); -- Default to 30 seconds
END;
$$ LANGUAGE plpgsql;

-- 15. Create function to get user's active webhooks
CREATE OR REPLACE FUNCTION get_user_webhooks(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  url TEXT,
  type TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.name, w.url, w.type, w.is_active
  FROM webhooks w
  WHERE w.user_id = user_uuid AND w.is_active = true
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql; 