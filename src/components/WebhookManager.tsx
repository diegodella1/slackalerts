'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Webhook } from '@/types/database';

export function WebhookManager() {
  const supabase = createClient();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    type: 'slack' as 'slack' | 'discord' | 'webhook'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWebhooks(data);
      }
    } catch {
      // Silently handle error
    }
  }, [supabase]);

  // Fetch user's webhooks
  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to add webhooks');
        return;
      }

      // Validate Slack webhook URL
      if (newWebhook.type === 'slack' && !newWebhook.url.startsWith('https://hooks.slack.com/')) {
        setError('Invalid Slack webhook URL. Must start with https://hooks.slack.com/');
        return;
      }

      const { error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          name: newWebhook.name,
          url: newWebhook.url,
          type: newWebhook.type,
          is_active: true
        });

      if (error) {
        setError(`Error adding webhook: ${error.message}`);
      } else {
        // Reset form and close dialog
        setNewWebhook({ name: '', url: '', type: 'slack' });
        setIsDialogOpen(false);
        fetchWebhooks(); // Refresh the list
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ is_active: false })
        .eq('id', webhookId);

      if (error) {
        setError(`Error deleting webhook: ${error.message}`);
      } else {
        fetchWebhooks(); // Refresh the list
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return '💬';
      case 'discord':
        return '🎮';
      default:
        return '🔗';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Manage your Slack notification webhooks</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Webhook</DialogTitle>
                <DialogDescription>
                  Add a new Slack webhook to receive notifications
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWebhook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="e.g., Bitcoin Alerts Channel"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-type">Type</Label>
                  <Select
                    value={newWebhook.type}
                    onValueChange={(value: 'slack' | 'discord' | 'webhook') => 
                      setNewWebhook(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="webhook">Generic Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder={newWebhook.type === 'slack' ? 'https://hooks.slack.com/services/...' : 'https://...'}
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    required
                  />
                  {newWebhook.type === 'slack' && (
                    <p className="text-xs text-muted-foreground">
                      Get your Slack webhook URL from your Slack app settings
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Webhook'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {webhooks.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No webhooks yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first webhook to receive Bitcoin price alerts
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWebhookIcon(webhook.type)}</span>
                  <div>
                    <h4 className="font-medium">{webhook.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {webhook.url.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {webhook.type}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 