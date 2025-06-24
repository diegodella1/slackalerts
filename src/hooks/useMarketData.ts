import { useState, useEffect } from 'react';

export interface MarketData {
  price: number;
  change_24h: number;
  change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
}

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/market-data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }

        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();

    // Refresh market data every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { marketData, isLoading, error };
} 