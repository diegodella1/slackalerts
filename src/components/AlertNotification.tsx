'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Alert {
  id: string;
  message: string;
  created_at: string;
  price_at_trigger?: number;
  rule_name?: string;
  condition_type?: string;
}

export function AlertNotification() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('alerts_sent')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts_sent',
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only last 5 alerts
          setIsVisible(true);
          
          // Auto-hide after 10 seconds
          setTimeout(() => {
            setIsVisible(false);
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    if (alerts.length <= 1) {
      setIsVisible(false);
    }
  };

  const getConditionIcon = (conditionType?: string) => {
    switch (conditionType) {
      case 'price_above':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'price_below':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'variation_up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'variation_down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className="bg-green-50 border-green-200 animate-in slide-in-from-right-2 duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getConditionIcon(alert.condition_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    {alert.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {alert.rule_name && (
                      <Badge variant="outline" className="text-xs">
                        {alert.rule_name}
                      </Badge>
                    )}
                    {alert.price_at_trigger && (
                      <span className="text-xs text-green-600">
                        {formatPrice(alert.price_at_trigger)}
                      </span>
                    )}
                    <span className="text-xs text-green-600">
                      {formatTime(alert.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="text-green-600 hover:text-green-800 -mt-1 -mr-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 