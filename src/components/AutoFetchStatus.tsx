'use client';

import { usePriceContext } from './QueryProvider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Play, Pause, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function AutoFetchStatus() {
  const { 
    isAutoFetching, 
    toggleAutoFetch, 
    currentPrice, 
    lastUpdate, 
    error 
  } = usePriceContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg transition-all duration-300">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium text-sm">Bitcoin Monitor</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              onClick={toggleAutoFetch}
              variant={isAutoFetching ? "destructive" : "default"}
              size="sm"
              className="h-7 px-2"
            >
              {isAutoFetching ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span className="ml-1 text-xs">Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span className="ml-1 text-xs">Start</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 space-y-3 max-w-[280px]">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status:</span>
              <Badge variant={isAutoFetching ? "default" : "secondary"} className="text-xs">
                {isAutoFetching ? "Live" : "Inactive"}
              </Badge>
            </div>

            {/* Current Price */}
            {currentPrice && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Price:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatPrice(currentPrice)}
                </span>
              </div>
            )}

            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Updated:</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(lastUpdate)}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error:</span>
                <span className="text-xs text-red-500 truncate max-w-[150px]">
                  {error}
                </span>
              </div>
            )}

            {/* Auto-refresh indicator */}
            {isAutoFetching && (
              <div className="flex items-center justify-center pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Auto-refresh every 30s
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <p>• Monitor continues across all pages</p>
              <p>• State persists between sessions</p>
              <p>• Create alerts in Rules section</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 