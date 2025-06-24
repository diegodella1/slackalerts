'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_WEBHOOK_URL } from '@/lib/validation/rule';
import { ArrowLeft, Save, Bell, Settings } from 'lucide-react';

export function EnhancedRuleForm() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    condition_type: 'price_above',
    value: '',
    window_minutes: 5,
    message_template: 'Bitcoin price alert: {{condition_type}} {{value}} at {{price}}',
    enabled: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load URL parameters if editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const updates: Record<string, string | number> = {};
    
    ['name', 'condition_type', 'value', 'window_minutes', 'message_template'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        if (key === 'value' || key === 'window_minutes') {
          updates[key] = parseFloat(value);
        } else {
          updates[key] = value;
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Rule name is required');
      return false;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('Value must be greater than 0');
      return false;
    }
    if (formData.window_minutes < 1) {
      setError('Time window must be at least 1 minute');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to create rules');
        return;
      }

      const { error: insertError } = await supabase
        .from('rules')
        .insert({
          user_id: user.id,
          name: formData.name,
          condition_type: formData.condition_type,
          value: parseFloat(formData.value),
          window_minutes: formData.window_minutes,
          message_template: formData.message_template,
          webhook_url: DEFAULT_WEBHOOK_URL,
          enabled: formData.enabled
        });

      if (insertError) {
        setError(`Error creating rule: ${insertError.message}`);
      } else {
        setSuccess('Rule created successfully!');
        setTimeout(() => {
          router.push('/rules');
        }, 1500);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionDescription = () => {
    const descriptions = {
      price_above: 'Alert when Bitcoin price goes above the specified value',
      price_below: 'Alert when Bitcoin price goes below the specified value',
      variation_up: 'Alert when Bitcoin price increases by the specified percentage',
      variation_down: 'Alert when Bitcoin price decreases by the specified percentage',
      volatility_extreme: 'Alert when Bitcoin price volatility exceeds the specified percentage',
      ath_break: 'Alert when Bitcoin breaks its all-time high',
      atl_break: 'Alert when Bitcoin breaks its all-time low',
      support_resistance: 'Alert when Bitcoin reaches support or resistance levels',
      volume_spike: 'Alert when trading volume spikes by the specified percentage',
      sentiment_change: 'Alert when market sentiment changes significantly'
    };
    return descriptions[formData.condition_type as keyof typeof descriptions] || '';
  };

  const getValueLabel = () => {
    const labels = {
      price_above: 'Price Above ($)',
      price_below: 'Price Below ($)',
      variation_up: 'Increase Percentage (%)',
      variation_down: 'Decrease Percentage (%)',
      volatility_extreme: 'Volatility Threshold (%)',
      ath_break: 'ATH Break (Auto)',
      atl_break: 'ATL Break (Auto)',
      support_resistance: 'Support/Resistance Level ($)',
      volume_spike: 'Volume Increase (%)',
      sentiment_change: 'Sentiment Threshold (%)'
    };
    return labels[formData.condition_type as keyof typeof labels] || 'Value';
  };

  const isValueDisabled = () => {
    return ['ath_break', 'atl_break'].includes(formData.condition_type);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Alert Rule</h1>
            <p className="text-muted-foreground">
              Set up a new Bitcoin price alert with custom conditions
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Bitcoin above $70,000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="condition_type">Condition Type</Label>
                <Select
                  value={formData.condition_type}
                  onValueChange={(value) => handleInputChange('condition_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_above">Price Above</SelectItem>
                    <SelectItem value="price_below">Price Below</SelectItem>
                    <SelectItem value="variation_up">Price Increase</SelectItem>
                    <SelectItem value="variation_down">Price Decrease</SelectItem>
                    <SelectItem value="volatility_extreme">High Volatility</SelectItem>
                    <SelectItem value="ath_break">New All-Time High</SelectItem>
                    <SelectItem value="atl_break">New All-Time Low</SelectItem>
                    <SelectItem value="support_resistance">Support/Resistance</SelectItem>
                    <SelectItem value="volume_spike">Volume Spike</SelectItem>
                    <SelectItem value="sentiment_change">Sentiment Change</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {getConditionDescription()}
                </p>
              </div>

              <div>
                <Label htmlFor="value">{getValueLabel()}</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  disabled={isValueDisabled()}
                  placeholder={isValueDisabled() ? "Auto-detected" : "Enter value"}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="window_minutes">Time Window (minutes)</Label>
                <Input
                  id="window_minutes"
                  type="number"
                  min="1"
                  value={formData.window_minutes}
                  onChange={(e) => handleInputChange('window_minutes', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  How long to monitor for this condition
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message_template">Message Template</Label>
                <Textarea
                  id="message_template"
                  value={formData.message_template}
                  onChange={(e) => handleInputChange('message_template', e.target.value)}
                  placeholder="Custom message for the alert"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use placeholders: {'{price}'}, {'{condition_type}'}, {'{value}'}, {'{window}'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Slack Integration:</strong> All alerts will be sent to the configured Slack channel automatically.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Enable Rule</Label>
                  <p className="text-sm text-muted-foreground">
                    Activate this rule immediately
                  </p>
                </div>
                <input
                  id="enabled"
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/rules')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Rule
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 