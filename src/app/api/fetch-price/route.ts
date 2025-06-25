import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

const ROXOM_API_URL = 'https://rtvapi.roxom.com/btc/info?apiKey=60be7d11-ec67-4ac0-9241-da1cbdcba73d';

function parsePriceString(priceString: string) {
  // Extract price from strings like "$100,533.13 \n -1452.14 [-1.42%]"
  const priceMatch = priceString.match(/\$([\d,]+\.?\d*)/);
  const changeMatch = priceString.match(/-?([\d,]+\.?\d*)\s*\[(-?\d+\.?\d*)%\]/);
  
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
  const change = changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : null;
  const changePercent = changeMatch ? parseFloat(changeMatch[2]) : null;
  
  return { price, change, changePercent };
}

async function checkAndTriggerAlerts(supabase: SupabaseClient, currentPrice: number, currentChangePercent: number | null) {
  try {
    // Get all active rules
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('enabled', true);
    
    if (error || !rules) {
      console.error('Error getting rules:', error);
      return;
    }
    
    const triggeredAlerts = [];
    
    for (const rule of rules) {
      let shouldTrigger = false;
      let alertMessage = '';
      
      // Use the new schema fields
      const ruleValue = rule.absolute_value || rule.percentage_value || rule.value;
      
      switch (rule.condition_type) {
        case 'price_above':
          if (currentPrice > ruleValue) {
            shouldTrigger = true;
            alertMessage = rule.message_template
              .replace('{price}', currentPrice.toLocaleString())
              .replace('{target}', ruleValue.toLocaleString())
              .replace('{change}', currentChangePercent ? currentChangePercent.toFixed(2) : '0')
              .replace('{timestamp}', new Date().toLocaleString());
          }
          break;
          
        case 'price_below':
          if (currentPrice < ruleValue) {
            shouldTrigger = true;
            alertMessage = rule.message_template
              .replace('{price}', currentPrice.toLocaleString())
              .replace('{target}', ruleValue.toLocaleString())
              .replace('{change}', currentChangePercent ? currentChangePercent.toFixed(2) : '0')
              .replace('{timestamp}', new Date().toLocaleString());
          }
          break;
          
        case 'variation_up':
          if (currentChangePercent && currentChangePercent > ruleValue) {
            shouldTrigger = true;
            alertMessage = rule.message_template
              .replace('{price}', currentPrice.toLocaleString())
              .replace('{target}', ruleValue.toString())
              .replace('{change}', currentChangePercent.toFixed(2))
              .replace('{timestamp}', new Date().toLocaleString());
          }
          break;
          
        case 'variation_down':
          if (currentChangePercent && currentChangePercent < -ruleValue) {
            shouldTrigger = true;
            alertMessage = rule.message_template
              .replace('{price}', currentPrice.toLocaleString())
              .replace('{target}', ruleValue.toString())
              .replace('{change}', Math.abs(currentChangePercent).toFixed(2))
              .replace('{timestamp}', new Date().toLocaleString());
          }
          break;
      }
      
      if (shouldTrigger) {
        // Save alert to database
        const { error: alertError } = await supabase
          .from('alerts_sent')
          .insert([{
            rule_id: rule.id,
            triggered_at: new Date().toISOString(),
            price_at_trigger: currentPrice,
            message: alertMessage,
            webhook_sent: false
          }]);
        
        if (!alertError) {
          let webhookSent = false;
          
          // Send webhook if configured
          const webhookUrl = rule.webhook_url || process.env.SLACK_WEBHOOK_URL;
          if (webhookUrl) {
            try {
              await axios.post(webhookUrl, {
                text: alertMessage,
                price: currentPrice,
                variation: currentChangePercent,
                timestamp: new Date().toISOString()
              }, {
                headers: { 'Content-Type': 'application/json' }
              });
              
              webhookSent = true;
              
              // Update alert with webhook status
              await supabase
                .from('alerts_sent')
                .update({ webhook_sent: true })
                .eq('rule_id', rule.id)
                .gte('triggered_at', new Date(Date.now() - 60000).toISOString()); // Last minute
                
            } catch (webhookError) {
              console.error('Error sending webhook:', webhookError);
            }
          }
          
          triggeredAlerts.push({
            rule: rule.name,
            message: alertMessage,
            webhook_sent: webhookSent
          });
        }
      }
    }
    
    return triggeredAlerts;
  } catch (error) {
    console.error('Error checking alerts:', error);
    return [];
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log('🔄 Fetching Bitcoin price from Roxom API...');
    
    // Get data from Roxom API
    const response = await axios.get(ROXOM_API_URL);
    const data = response.data;
    
    // Extract relevant information
    const priceInfo = parsePriceString(data.price.live_price);
    const marketCap = data.price_.market_cap;
    const volume24h = data.trading.daily_btc_trading_vol;
    
    if (!priceInfo.price) {
      return NextResponse.json(
        { error: 'Could not extract price from response' },
        { status: 400 }
      );
    }
    
    console.log(`💰 Current price: $${priceInfo.price.toLocaleString()}`);
    console.log(`📈 Change: ${priceInfo.change ? priceInfo.change.toLocaleString() : 'N/A'} (${priceInfo.changePercent ? priceInfo.changePercent.toFixed(2) : 'N/A'}%)`);
    
    // Save to price history table
    const { error: historyError } = await supabase
      .from('price_history')
      .insert([{
        price: priceInfo.price,
        timestamp: new Date().toISOString(),
        source: 'roxom_api'
      }]);
    
    if (historyError) {
      console.error('❌ Error saving price history:', historyError);
    }
    
    // Check rules and trigger alerts
    const triggeredAlerts = await checkAndTriggerAlerts(supabase, priceInfo.price, priceInfo.changePercent);
    
    return NextResponse.json({
      success: true,
      price: priceInfo.price,
      change: priceInfo.change,
      changePercent: priceInfo.changePercent,
      marketCap,
      volume24h,
      triggeredAlerts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in fetch-price API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current price from history (latest entry)
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error getting price history:', error);
      return NextResponse.json(
        { error: 'Error retrieving price data' },
        { status: 500 }
      );
    }
    
    if (!priceHistory || priceHistory.length === 0) {
      return NextResponse.json(
        { error: 'No price data available' },
        { status: 404 }
      );
    }
    
    const latestPrice = priceHistory[0];
    
    return NextResponse.json({
      success: true,
      price: latestPrice.price,
      timestamp: latestPrice.timestamp,
      source: latestPrice.source
    });
    
  } catch (error) {
    console.error('Error in GET fetch-price API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 