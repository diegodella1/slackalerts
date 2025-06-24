-- Complete Database Schema for Bitcoin Price Alert System
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create basic tables if they don't exist
CREATE TABLE IF NOT EXISTS rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('price_above', 'price_below', 'variation_up', 'variation_down')),
  value DECIMAL NOT NULL,
  window_minutes INTEGER DEFAULT 5,
  message_template TEXT NOT NULL,
  webhook_url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  price DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'roxom_api'
);

CREATE TABLE IF NOT EXISTS alerts_sent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_at_trigger DECIMAL NOT NULL,
  message TEXT NOT NULL,
  webhook_sent BOOLEAN DEFAULT false,
  webhook_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add new columns to the rules table for more specific conditions
ALTER TABLE rules ADD COLUMN IF NOT EXISTS condition_subtype TEXT DEFAULT 'simple';
ALTER TABLE rules ADD COLUMN IF NOT EXISTS percentage_value DECIMAL DEFAULT NULL;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS absolute_value DECIMAL DEFAULT NULL;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS time_window_minutes INTEGER DEFAULT 5;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS target_price DECIMAL DEFAULT NULL;
ALTER TABLE rules ADD COLUMN IF NOT EXISTS price_change_amount DECIMAL DEFAULT NULL;

-- 3. Add check constraints for data validation
ALTER TABLE rules ADD CONSTRAINT IF NOT EXISTS check_condition_values 
  CHECK (
    (condition_type IN ('price_target', 'price_change') AND target_price IS NOT NULL) OR
    (condition_type IN ('percentage_change', 'absolute_change') AND percentage_value IS NOT NULL) OR
    (condition_type IN ('price_above', 'price_below') AND absolute_value IS NOT NULL) OR
    (condition_type IN ('ath_break', 'atl_break'))
  );

-- 4. Update existing rules to use new structure
UPDATE rules SET 
  condition_subtype = 'simple',
  absolute_value = value,
  time_window_minutes = window_minutes
WHERE condition_type IN ('price_above', 'price_below');

UPDATE rules SET 
  condition_subtype = 'simple',
  percentage_value = value,
  time_window_minutes = window_minutes
WHERE condition_type IN ('variation_up', 'variation_down');

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rules_condition_type ON rules(condition_type);
CREATE INDEX IF NOT EXISTS idx_rules_enabled ON rules(enabled);
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_rule_id ON alerts_sent(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_triggered_at ON alerts_sent(triggered_at);

-- 6. Add comments for documentation
COMMENT ON COLUMN rules.condition_subtype IS 'Type of condition: simple, percentage, absolute, combined';
COMMENT ON COLUMN rules.percentage_value IS 'Percentage value for percentage-based conditions';
COMMENT ON COLUMN rules.absolute_value IS 'Absolute value for price-based conditions';
COMMENT ON COLUMN rules.time_window_minutes IS 'Time window in minutes for the condition';
COMMENT ON COLUMN rules.target_price IS 'Target price for price target conditions';
COMMENT ON COLUMN rules.price_change_amount IS 'Amount of price change for change-based conditions';

-- 7. Create a view for easier rule querying
CREATE OR REPLACE VIEW rules_summary AS
SELECT 
  id,
  name,
  condition_type,
  condition_subtype,
  CASE 
    WHEN condition_type = 'price_target' THEN 'Reach ' || target_price::text || ' USD'
    WHEN condition_type = 'price_change' THEN 'Change by ' || price_change_amount::text || ' USD in ' || time_window_minutes::text || ' min'
    WHEN condition_type = 'percentage_change' THEN 'Change by ' || percentage_value::text || '% in ' || time_window_minutes::text || ' min'
    WHEN condition_type = 'absolute_change' THEN 'Change by ' || absolute_value::text || ' USD in ' || time_window_minutes::text || ' min'
    WHEN condition_type = 'price_above' THEN 'Above ' || absolute_value::text || ' USD'
    WHEN condition_type = 'price_below' THEN 'Below ' || absolute_value::text || ' USD'
    WHEN condition_type = 'ath_break' THEN 'Break All-Time High'
    WHEN condition_type = 'atl_break' THEN 'Break All-Time Low'
    ELSE 'Unknown condition'
  END as condition_description,
  enabled,
  created_at,
  updated_at
FROM rules;

-- 8. Enable Row Level Security
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_sent ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
-- Rules policies
DROP POLICY IF EXISTS "Users can view their own rules" ON rules;
CREATE POLICY "Users can view their own rules" ON rules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own rules" ON rules;
CREATE POLICY "Users can insert their own rules" ON rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rules" ON rules;
CREATE POLICY "Users can update their own rules" ON rules
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own rules" ON rules;
CREATE POLICY "Users can delete their own rules" ON rules
  FOR DELETE USING (auth.uid() = user_id);

-- Price history policies (read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view price history" ON price_history;
CREATE POLICY "Authenticated users can view price history" ON price_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alerts policies
DROP POLICY IF EXISTS "Users can view their own alerts" ON alerts_sent;
CREATE POLICY "Users can view their own alerts" ON alerts_sent
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rules 
      WHERE rules.id = alerts_sent.rule_id 
      AND rules.user_id = auth.uid()
    )
  );

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_rules_updated_at ON rules;
CREATE TRIGGER update_rules_updated_at
    BEFORE UPDATE ON rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUPABASE AUTHENTICATION & USER MANAGEMENT
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts_sent ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR RULES TABLE
-- =====================================================

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

-- All authenticated users can view price history
CREATE POLICY "Authenticated users can view price history" ON price_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only system can insert price history (via API)
CREATE POLICY "System can insert price history" ON price_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR ALERTS_SENT TABLE
-- =====================================================

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
-- USER PROFILE TABLE (Optional - for additional user data)
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

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

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
-- VIEWS FOR EASIER QUERIES
-- =====================================================

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

-- =====================================================
-- FUNCTIONS FOR ALERT PROCESSING
-- =====================================================

-- Function to check if a rule should trigger an alert
CREATE OR REPLACE FUNCTION check_rule_trigger(
  rule_id UUID,
  current_price DECIMAL,
  price_change_percent DECIMAL DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  rule_record RECORD;
  should_trigger BOOLEAN := FALSE;
BEGIN
  -- Get rule details
  SELECT * INTO rule_record FROM rules WHERE id = rule_id AND enabled = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check condition based on rule type
  CASE rule_record.condition_type
    WHEN 'price_above' THEN
      should_trigger := current_price > rule_record.value;
    WHEN 'price_below' THEN
      should_trigger := current_price < rule_record.value;
    WHEN 'variation_up' THEN
      should_trigger := price_change_percent > rule_record.value;
    WHEN 'variation_down' THEN
      should_trigger := price_change_percent < -rule_record.value;
    ELSE
      should_trigger := FALSE;
  END CASE;
  
  RETURN should_trigger;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean old price history (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_price_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM price_history 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old alerts (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM alerts_sent 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE rules IS 'User-defined price alert rules';
COMMENT ON TABLE price_history IS 'Historical Bitcoin price data';
COMMENT ON TABLE alerts_sent IS 'Triggered alerts sent to users';
COMMENT ON TABLE user_profiles IS 'Additional user profile information';

COMMENT ON FUNCTION validate_roxom_email() IS 'Validates that only @roxom.com and @roxom.tv emails are allowed';
COMMENT ON FUNCTION handle_new_user() IS 'Creates user profile when new user registers';
COMMENT ON FUNCTION check_rule_trigger() IS 'Checks if a rule should trigger based on current price data';
COMMENT ON FUNCTION cleanup_old_price_history() IS 'Removes price history older than 30 days';
COMMENT ON FUNCTION cleanup_old_alerts() IS 'Removes alerts older than 90 days'; 