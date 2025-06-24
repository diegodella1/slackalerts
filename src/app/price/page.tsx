'use client';

import { usePriceContext } from '@/components/QueryProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useMarketData } from '@/hooks/useMarketData';

export default function PricePage() {
  const { 
    currentPrice, 
    isAutoFetching, 
    lastUpdate, 
    error 
  } = usePriceContext();

  const { marketData, isLoading: marketLoading, error: marketError } = useMarketData();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    }
    return formatPrice(volume);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Bitcoin Price Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time Bitcoin price monitoring with persistent auto-fetch
            </p>
          </div>

          {/* Main Price Display */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                {currentPrice ? (
                  <>
                    <div className="text-6xl font-bold text-green-600 mb-4">
                      {formatPrice(currentPrice)}
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>Bitcoin (BTC)</span>
                      {isAutoFetching && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Live
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-muted-foreground mb-2">
                      No Data
                    </div>
                    <p className="text-muted-foreground">
                      Start monitoring from the floating control panel
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monitor:</span>
                    <Badge variant={isAutoFetching ? "default" : "secondary"}>
                      {isAutoFetching ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection:</span>
                    <Badge variant={error ? "destructive" : "default"}>
                      {error ? "Error" : "Connected"}
                    </Badge>
                  </div>
                  {lastUpdate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Updated:</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(lastUpdate)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Market Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Info</CardTitle>
              </CardHeader>
              <CardContent>
                {marketLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : marketError ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h High:</span>
                      <span className="text-sm font-medium">$67,890</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h Low:</span>
                      <span className="text-sm font-medium">$65,120</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h Change:</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500">+2.34%</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Using fallback data
                    </div>
                  </div>
                ) : marketData ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h High:</span>
                      <span className="text-sm font-medium">
                        {formatPrice(marketData.high_24h)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h Low:</span>
                      <span className="text-sm font-medium">
                        {formatPrice(marketData.low_24h)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h Change:</span>
                      <div className="flex items-center gap-1">
                        {getChangeIcon(marketData.change_percentage_24h)}
                        <span className={`text-sm font-medium ${getChangeColor(marketData.change_percentage_24h)}`}>
                          {marketData.change_percentage_24h > 0 ? '+' : ''}
                          {marketData.change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">24h Volume:</span>
                      <span className="text-sm font-medium">
                        {formatVolume(marketData.volume_24h)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Updated: {new Date(marketData.last_updated).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-muted-foreground">No market data available</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Use the floating control panel in the bottom-right corner to:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Start/Stop price monitoring</li>
                    <li>• View real-time status</li>
                    <li>• Control from any page</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Connection Error:</span>
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Data Error Display */}
          {marketError && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-orange-600">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">Market Data Error:</span>
                  <span>{marketError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium mb-2">Persistent Monitoring</h4>
                  <ul className="space-y-1">
                    <li>• Auto-fetch continues across all pages</li>
                    <li>• State persists between browser sessions</li>
                    <li>• Updates every 30 seconds automatically</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Real Market Data</h4>
                  <ul className="space-y-1">
                    <li>• Live 24h high/low prices</li>
                    <li>• Real-time price changes</li>
                    <li>• Trading volume data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 