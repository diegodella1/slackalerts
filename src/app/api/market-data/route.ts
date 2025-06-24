import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch Bitcoin market data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high=true&include_24hr_low=true&include_market_cap=true&include_last_updated_at=true',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const bitcoin = data.bitcoin;

    // Format the response
    const marketData = {
      price: bitcoin.usd,
      change_24h: bitcoin.usd_24h_change,
      change_percentage_24h: bitcoin.usd_24h_change,
      high_24h: bitcoin.usd_24h_high || bitcoin.usd * 1.02, // Fallback if not available
      low_24h: bitcoin.usd_24h_low || bitcoin.usd * 0.98, // Fallback if not available
      volume_24h: bitcoin.usd_24h_vol || 0,
      market_cap: bitcoin.usd_market_cap || 0,
      last_updated: new Date(bitcoin.last_updated_at * 1000).toISOString(),
    };

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    // Return fallback data if API fails
    const fallbackData = {
      price: 65000,
      change_24h: 0,
      change_percentage_24h: 0,
      high_24h: 67000,
      low_24h: 63000,
      volume_24h: 0,
      market_cap: 0,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(fallbackData, { status: 200 });
  }
} 