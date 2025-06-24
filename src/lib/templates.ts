import { RuleTemplate } from '@/lib/validation/rule';

export const ruleTemplates: RuleTemplate[] = [
  // 1. Price Movements
  {
    id: 'btc_up_2_percent_5min',
    name: 'BTC rises more than 2% in 5 minutes',
    description: 'Alert when Bitcoin price increases by 2% or more within a 5-minute window',
    category: 'price_movement',
    condition_type: 'variation_up',
    value: 2,
    window_minutes: 5,
    message_template: '🚀 BTC Alert: Price up {{variation}}% in {{window}} minutes! Current price: ${{price}}',
    icon: '🔺',
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'btc_down_5_percent_15min',
    name: 'BTC drops more than 5% in 15 minutes',
    description: 'Alert when Bitcoin price decreases by 5% or more within a 15-minute window',
    category: 'price_movement',
    condition_type: 'variation_down',
    value: 5,
    window_minutes: 15,
    message_template: '📉 BTC Alert: Price down {{variation}}% in {{window}} minutes! Current price: ${{price}}',
    icon: '🔻',
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'btc_above_60k',
    name: 'BTC crosses above $60,000',
    description: 'Alert when Bitcoin price goes above the $60,000 resistance level',
    category: 'price_movement',
    condition_type: 'price_above',
    value: 60000,
    window_minutes: 1,
    message_template: '💎 BTC Alert: Price above ${{price}}! Breaking resistance level.',
    icon: '💎',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'btc_below_50k',
    name: 'BTC falls below $50,000',
    description: 'Alert when Bitcoin price drops below the $50,000 support level',
    category: 'price_movement',
    condition_type: 'price_below',
    value: 50000,
    window_minutes: 1,
    message_template: '⚠️ BTC Alert: Price below ${{price}}! Support level broken.',
    icon: '⚠️',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'volatility_extreme_5_percent_2min',
    name: 'Extreme volatility: 5% in 2 minutes',
    description: 'Alert for extreme price volatility of 5% or more within 2 minutes',
    category: 'price_movement',
    condition_type: 'volatility_extreme',
    value: 5,
    window_minutes: 2,
    message_template: '⚡ BTC Alert: Extreme volatility! {{variation}}% movement in {{window}} minutes. Price: ${{price}}',
    icon: '⚡',
    color: 'bg-purple-100 text-purple-800',
  },

  // 2. ATH & ATL
  {
    id: 'btc_new_ath',
    name: 'BTC reaches new All-Time High',
    description: 'Alert when Bitcoin breaks its previous all-time high price',
    category: 'ath_atl',
    condition_type: 'ath_break',
    value: 0,
    window_minutes: 1,
    message_template: '🌟 BTC Alert: NEW ALL-TIME HIGH! 🚀 Price: ${{price}}',
    icon: '🌟',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'btc_monthly_low',
    name: 'BTC hits monthly low',
    description: 'Alert when Bitcoin reaches its lowest price of the current month',
    category: 'ath_atl',
    condition_type: 'atl_break',
    value: 0,
    window_minutes: 1,
    message_template: '🕳️ BTC Alert: Monthly low reached. Price: ${{price}}',
    icon: '🕳️',
    color: 'bg-gray-100 text-gray-800',
  },

  // 3. Sentiment & Market
  {
    id: 'fear_greed_extreme',
    name: 'Fear & Greed Index extreme change',
    description: 'Alert when market sentiment changes dramatically (requires external API)',
    category: 'sentiment_market',
    condition_type: 'sentiment_change',
    value: 20,
    window_minutes: 1440, // 24 hours
    message_template: '🧠 BTC Alert: Extreme sentiment change! Fear & Greed Index moved {{variation}} points in {{window}} minutes',
    icon: '🧠',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'volume_spike_no_price',
    name: 'Volume spike without price movement',
    description: 'Alert when trading volume increases significantly without corresponding price movement',
    category: 'sentiment_market',
    condition_type: 'volume_spike',
    value: 200, // 200% increase
    window_minutes: 30,
    message_template: '🧪 BTC Alert: Volume spike detected! {{variation}}% volume increase with minimal price change. Possible manipulation?',
    icon: '🧪',
    color: 'bg-pink-100 text-pink-800',
  },

  // 4. On-chain & Institutional
  {
    id: 'whale_movement',
    name: 'Large whale movement detected',
    description: 'Alert for significant Bitcoin movements from large wallets (requires on-chain data)',
    category: 'onchain_institutional',
    condition_type: 'volume_spike',
    value: 1000, // 1000+ BTC moved
    window_minutes: 60,
    message_template: '🐋 BTC Alert: Whale movement detected! {{variation}} BTC moved in {{window}} minutes',
    icon: '🐋',
    color: 'bg-teal-100 text-teal-800',
  },

  // 5. External Events
  {
    id: 'halving_approaching',
    name: 'Bitcoin halving approaching',
    description: 'Alert when approaching Bitcoin halving event (requires date calculation)',
    category: 'external_events',
    condition_type: 'price_above',
    value: 0,
    window_minutes: 10080, // 1 week
    message_template: '🗓️ BTC Alert: Halving event approaching! {{window}} minutes until next halving',
    icon: '🗓️',
    color: 'bg-cyan-100 text-cyan-800',
  },

  // 6. System Alerts
  {
    id: 'rule_triggered_too_much',
    name: 'Rule triggered too frequently',
    description: 'Alert when a rule is triggered more than normal (system monitoring)',
    category: 'system_alerts',
    condition_type: 'variation_up',
    value: 10, // 10+ triggers in 24h
    window_minutes: 1440,
    message_template: '🚨 System Alert: Rule triggered {{variation}} times in {{window}} minutes. Consider adjusting sensitivity.',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
  },

  // 7. Combined & Advanced
  {
    id: 'btc_drop_volume_exit',
    name: 'BTC drops + volume exit from exchanges',
    description: 'Combined alert: BTC price drop with significant outflow from exchanges',
    category: 'combined_advanced',
    condition_type: 'variation_down',
    value: 3,
    window_minutes: 15,
    message_template: '🔀 BTC Alert: Price down {{variation}}% + exchange outflow detected in {{window}} minutes. Accumulation signal?',
    icon: '🔀',
    color: 'bg-violet-100 text-violet-800',
  },
  {
    id: 'btc_stable_6_hours',
    name: 'BTC stable for 6+ hours',
    description: 'Alert when Bitcoin price remains stable within 1% for 6+ hours',
    category: 'combined_advanced',
    condition_type: 'variation_up',
    value: 1,
    window_minutes: 360, // 6 hours
    message_template: '🕓 BTC Alert: Price stable within {{variation}}% for {{window}} minutes. Consolidation phase.',
    icon: '🕓',
    color: 'bg-slate-100 text-slate-800',
  },
];

export const templateCategories = [
  {
    id: 'price_movement',
    name: 'Price Movements',
    description: 'Basic price movement alerts',
    icon: '📈',
  },
  {
    id: 'ath_atl',
    name: 'ATH & ATL',
    description: 'All-time high and low alerts',
    icon: '🏆',
  },
  {
    id: 'sentiment_market',
    name: 'Sentiment & Market',
    description: 'Market sentiment and volume alerts',
    icon: '🧠',
  },
  {
    id: 'onchain_institutional',
    name: 'On-chain & Institutional',
    description: 'Blockchain and institutional activity',
    icon: '🏦',
  },
  {
    id: 'external_events',
    name: 'External Events',
    description: 'Halving, regulatory events, etc.',
    icon: '🗓️',
  },
  {
    id: 'system_alerts',
    name: 'System Alerts',
    description: 'System monitoring and health',
    icon: '⚙️',
  },
  {
    id: 'combined_advanced',
    name: 'Combined & Advanced',
    description: 'Complex multi-condition alerts',
    icon: '🔀',
  },
];

export function getTemplatesByCategory(category?: string) {
  if (!category) return ruleTemplates;
  return ruleTemplates.filter(template => template.category === category);
} 