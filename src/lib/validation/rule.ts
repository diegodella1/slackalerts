import { z } from 'zod';

// Default webhook URL for all alerts
export const DEFAULT_WEBHOOK_URL = 'https://hooks.slack.com/services/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';

// Simplified condition types
export const conditionTypeSchema = z.enum([
  'price_above',
  'price_below',
  'variation_up',
  'variation_down',
  'volatility_extreme',
  'ath_break',
  'atl_break',
  'support_resistance',
  'volume_spike',
  'sentiment_change'
]);

// Simplified rule schema
export const ruleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  condition_type: conditionTypeSchema,
  value: z.number().min(0, 'Value must be greater than 0'),
  window_minutes: z.number().min(1, 'Time window must be at least 1 minute').default(5),
  message_template: z.string().min(1, 'Message template is required'),
  webhook_url: z.string().default(DEFAULT_WEBHOOK_URL),
  enabled: z.boolean().default(true),
  user_id: z.string().optional(),
});

// Template schema for predefined rules
export const ruleTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  condition_type: conditionTypeSchema,
  value: z.number(),
  window_minutes: z.number(),
  message_template: z.string(),
  icon: z.string(),
  color: z.string(),
});

// Helper types
export type RuleFormValues = z.infer<typeof ruleSchema>;
export type ConditionType = z.infer<typeof conditionTypeSchema>;
export type RuleTemplate = z.infer<typeof ruleTemplateSchema>;

// Helper functions for condition descriptions
export const getConditionDescription = (conditionType: ConditionType): string => {
  const descriptions: Record<ConditionType, string> = {
    price_above: 'Alert when Bitcoin price goes above a specific value',
    price_below: 'Alert when Bitcoin price goes below a specific value',
    variation_up: 'Alert when Bitcoin price increases by a specific percentage',
    variation_down: 'Alert when Bitcoin price decreases by a specific percentage',
    volatility_extreme: 'Alert when Bitcoin price volatility reaches extreme levels',
    ath_break: 'Alert when Bitcoin price breaks above a historical high',
    atl_break: 'Alert when Bitcoin price breaks below a historical low',
    support_resistance: 'Alert when Bitcoin price encounters a significant support or resistance level',
    volume_spike: 'Alert when Bitcoin trading volume spikes',
    sentiment_change: 'Alert when Bitcoin sentiment changes significantly',
  };
  
  return descriptions[conditionType] || 'Unknown condition type';
};

export const getConditionExamples = (conditionType: ConditionType): string[] => {
  const examples: Record<ConditionType, string[]> = {
    price_above: ['Alert when BTC goes above $70,000', 'Alert when BTC goes above $100,000'],
    price_below: ['Alert when BTC drops below $50,000', 'Alert when BTC drops below $30,000'],
    variation_up: ['Alert when BTC rises 5%', 'Alert when BTC rises 10%'],
    variation_down: ['Alert when BTC drops 5%', 'Alert when BTC drops 10%'],
    volatility_extreme: ['Alert when BTC volatility spikes', 'Alert when BTC volatility reaches extreme levels'],
    ath_break: ['Alert when BTC breaks above $100,000', 'Alert when BTC breaks above $150,000'],
    atl_break: ['Alert when BTC breaks below $30,000', 'Alert when BTC breaks below $20,000'],
    support_resistance: ['Alert when BTC encounters strong support at $50,000', 'Alert when BTC encounters strong resistance at $70,000'],
    volume_spike: ['Alert when BTC trading volume spikes', 'Alert when BTC trading volume reaches extreme levels'],
    sentiment_change: ['Alert when BTC sentiment shifts positively', 'Alert when BTC sentiment shifts negatively'],
  };
  
  return examples[conditionType] || [];
};

export const getConditionIcon = (conditionType: ConditionType): string => {
  const icons: Record<ConditionType, string> = {
    price_above: '💎',
    price_below: '⚠️',
    variation_up: '🔺',
    variation_down: '🔻',
    volatility_extreme: '🌪',
    ath_break: '��',
    atl_break: '🌕',
    support_resistance: '🛡',
    volume_spike: '📈',
    sentiment_change: '🤑',
  };
  
  return icons[conditionType] || '🔔';
}; 