-- =====================================================
-- ESSENTIAL DATABASE SETUP FOR BITCOIN PRICE ALERTS
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_sent ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR RULES TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own rules" ON rules;
DROP POLICY IF EXISTS "Users can insert their own rules" ON rules;
DROP POLICY IF EXISTS "Users can update their own rules" ON rules;
DROP POLICY IF EXISTS "Users can delete their own rules" ON rules;

-- Users can view their own rules
CREATE POLICY "Users can view their own rules" ON rules
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own rules
CREATE POLICY "Users can insert their own rules" ON rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rules
CREATE POLICY "Users can update their own rules" ON rules
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own rules
CREATE POLICY "Users can delete their own rules" ON rules
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES FOR PRICE_HISTORY TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view price history" ON price_history;
DROP POLICY IF EXISTS "System can insert price history" ON price_history;

-- All authenticated users can view price history
CREATE POLICY "Authenticated users can view price history" ON price_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only system can insert price history (via API)
CREATE POLICY "System can insert price history" ON price_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR ALERTS_SENT TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their alerts" ON alerts_sent;
DROP POLICY IF EXISTS "System can insert alerts" ON alerts_sent;

-- Users can view alerts triggered by their rules
CREATE POLICY "Users can view their alerts" ON alerts_sent
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rules 
      WHERE rules.id = alerts_sent.rule_id 
      AND rules.user_id = auth.uid()
    )
  );

-- System can insert alerts (via API)
CREATE POLICY "System can insert alerts" ON alerts_sent
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- EMAIL DOMAIN VALIDATION FUNCTION
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_email_domain ON auth.users;

-- Function to validate email domain
CREATE OR REPLACE FUNCTION validate_roxom_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email domain is allowed
  IF NEW.email !~ '^[^@]+@(roxom\.com|roxom\.tv)$' THEN
    RAISE EXCEPTION 'Only @roxom.com and @roxom.tv email addresses are allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate email on user registration
CREATE TRIGGER validate_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_roxom_email();

-- =====================================================
-- USER PROFILE TABLE
-- =====================================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to create user profile on registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for rules table
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled);
CREATE INDEX IF NOT EXISTS idx_rules_condition_type ON rules(condition_type);

-- Indexes for price_history table
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON price_history(price);

-- Indexes for alerts_sent table
CREATE INDEX IF NOT EXISTS idx_alerts_sent_rule_id ON alerts_sent(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_created_at ON alerts_sent(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_webhook_sent ON alerts_sent(webhook_sent);

-- =====================================================
-- VIEWS FOR EASIER QUERIES (OPTIONAL)
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS user_rules_with_alerts;
DROP VIEW IF EXISTS user_recent_alerts;

-- View for user rules with alert counts
CREATE OR REPLACE VIEW user_rules_with_alerts AS
SELECT 
  r.*,
  COUNT(a.id) as alert_count,
  MAX(a.created_at) as last_alert_at
FROM rules r
LEFT JOIN alerts_sent a ON r.id = a.rule_id
WHERE r.user_id = auth.uid()
GROUP BY r.id, r.name, r.condition_type, r.value, r.window_minutes, 
         r.message_template, r.webhook_url, r.enabled, r.user_id, r.created_at, r.updated_at;

-- View for recent alerts with rule info
CREATE OR REPLACE VIEW user_recent_alerts AS
SELECT 
  a.*,
  r.name as rule_name,
  r.condition_type
FROM alerts_sent a
JOIN rules r ON a.rule_id = r.id
WHERE r.user_id = auth.uid()
ORDER BY a.created_at DESC; 