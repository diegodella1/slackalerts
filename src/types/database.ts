export type Rule = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  condition_type: 'variation_up' | 'variation_down' | 'price_above' | 'price_below';
  condition_subtype?: string;
  value: number;
  percentage_value?: number;
  absolute_value?: number;
  time_window_minutes?: number;
  target_price?: number;
  price_change_amount?: number;
  window_minutes: number;
  message_template: string;
  webhook_url?: string;
  webhook_id?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Alert = {
  id: string;
  rule_id: string;
  triggered_at: string;
  price_at_trigger: number;
  message: string;
  webhook_sent: boolean;
  webhook_response?: string;
  created_at: string;
  rules?: {
    id: string;
    name: string;
    condition_type: string;
  };
};

export type PriceHistory = {
  id: string;
  price: number;
  timestamp: string;
  source: string;
};

export type RuleTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  condition_type: 'variation_up' | 'variation_down' | 'price_above' | 'price_below';
  default_value: number;
  default_window_minutes: number;
  default_message_template: string;
  created_at: string;
};

export type Webhook = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  type: 'slack' | 'discord' | 'webhook';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type RefreshSettings = {
  id: string;
  user_id: string;
  refresh_interval_seconds: 10 | 30;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}; 