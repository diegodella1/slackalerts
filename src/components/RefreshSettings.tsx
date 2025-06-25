'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { RefreshSettings } from '@/types/database';

export function RefreshSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<RefreshSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<10 | 30>(30);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to view settings');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('refresh_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        setError(`Error loading settings: ${fetchError.message}`);
      } else {
        if (data) {
          setSettings(data);
          setSelectedInterval(data.refresh_interval_seconds);
        } else {
          // Create default settings if none exist
          try {
            const { data: newData, error } = await supabase
              .from('refresh_settings')
              .insert({
                user_id: user.id,
                refresh_interval_seconds: 30,
                is_active: true
              })
              .select()
              .single();

            if (error) {
              setError(`Error creating default settings: ${error.message}`);
            } else {
              setSettings(newData);
              setSelectedInterval(newData.refresh_interval_seconds);
            }
          } catch {
            setError('An unexpected error occurred');
          }
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Fetch user's refresh settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdateInterval = async () => {
    if (!settings) return;

    setIsUpdating(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('refresh_settings')
        .update({ refresh_interval_seconds: selectedInterval })
        .eq('id', settings.id);

      if (error) {
        setError(`Error updating settings: ${error.message}`);
      } else {
        setSettings(prev => prev ? { ...prev, refresh_interval_seconds: selectedInterval } : null);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const getIntervalDescription = (interval: number) => {
    switch (interval) {
      case 10:
        return 'Fast updates (10 seconds) - More responsive but higher API usage';
      case 30:
        return 'Standard updates (30 seconds) - Balanced performance and API usage';
      default:
        return 'Unknown interval';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refresh Settings</CardTitle>
          <CardDescription>Configure how often to check Bitcoin prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refresh Settings</CardTitle>
        <CardDescription>Configure how often to check Bitcoin prices from Roxom TV API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Refresh Interval</label>
            <Select
              value={selectedInterval.toString()}
              onValueChange={(value) => setSelectedInterval(parseInt(value) as 10 | 30)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getIntervalDescription(selectedInterval)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Current: {settings?.refresh_interval_seconds || 30}s
            </Badge>
            {selectedInterval !== settings?.refresh_interval_seconds && (
              <Badge variant="secondary">Modified</Badge>
            )}
          </div>

          <Button
            onClick={handleUpdateInterval}
            disabled={isUpdating || selectedInterval === settings?.refresh_interval_seconds}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Settings'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">About Refresh Rates</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>10 seconds:</strong> More responsive alerts, higher API usage</li>
            <li>• <strong>30 seconds:</strong> Standard rate, balanced performance</li>
            <li>• Changes take effect immediately for new price checks</li>
            <li>• API calls are made to Roxom TV Bitcoin price endpoint</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 