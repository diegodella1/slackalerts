'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Filter, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Alert = {
  id: string;
  rule_id: string;
  rule_name: string;
  condition_type: string;
  triggered_price: number;
  message: string;
  webhook_sent: boolean;
  created_at: string;
};

export function AlertsPageClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user's alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to view alerts');
          return;
        }

        // Use direct query instead of the view
        const { data, error: fetchError } = await supabase
          .from('alerts_sent')
          .select(`
            *,
            rules (
              id,
              name,
              condition_type
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) {
          setError(`Error loading alerts: ${fetchError.message}`);
        } else {
          // Transform the data to match our Alert type
          const transformedAlerts = (data || []).map(alert => ({
            id: alert.id,
            rule_id: alert.rule_id,
            rule_name: alert.rules?.name || 'Unknown Rule',
            condition_type: alert.rules?.condition_type || 'unknown',
            triggered_price: alert.triggered_price || 0,
            message: alert.message || 'Alert triggered',
            webhook_sent: alert.webhook_sent || false,
            created_at: alert.created_at
          }));
          
          setAlerts(transformedAlerts);
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [supabase]);

  const getStatusIcon = (webhookSent: boolean) => {
    if (webhookSent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (webhookSent: boolean) => {
    return (
      <Badge variant={webhookSent ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(webhookSent)}
        {webhookSent ? "Sent" : "Failed"}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Filter alerts based on search and status
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'sent' && alert.webhook_sent) ||
                         (statusFilter === 'failed' && !alert.webhook_sent);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Alert History</h1>
            <p className="text-muted-foreground">
              View all triggered alerts and notification status
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent Successfully</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.webhook_sent).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => !a.webhook_sent).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => {
                      const today = new Date();
                      const alertDate = new Date(a.created_at);
                      return alertDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search alerts by rule name or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts ({alerts.length})</SelectItem>
                    <SelectItem value="sent">Sent ({alerts.filter(a => a.webhook_sent).length})</SelectItem>
                    <SelectItem value="failed">Failed ({alerts.filter(a => !a.webhook_sent).length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{alert.rule_name}</h3>
                        {getStatusBadge(alert.webhook_sent)}
                      </div>
                      <p className="text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Triggered at: {formatPrice(alert.triggered_price)}</span>
                        <span>•</span>
                        <span>{formatTime(alert.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No alerts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Alerts will appear here when your rules are triggered
                </p>
                <Button asChild>
                  <Link href="/rules/new">Create Your First Rule</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* No search results */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 