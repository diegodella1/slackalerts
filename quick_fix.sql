-- =====================================================
-- QUICK FIX FOR MISSING VIEWS AND TRIGGERS
-- =====================================================

-- Drop existing trigger if it exists (to avoid the error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Drop existing views if they exist
DROP VIEW IF EXISTS user_rules_with_alerts;
DROP VIEW IF EXISTS user_recent_alerts;

-- Create the views that were missing
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

CREATE OR REPLACE VIEW user_recent_alerts AS
SELECT 
  a.*,
  r.name as rule_name,
  r.condition_type
FROM alerts_sent a
JOIN rules r ON a.rule_id = r.id
WHERE r.user_id = auth.uid()
ORDER BY a.created_at DESC; 