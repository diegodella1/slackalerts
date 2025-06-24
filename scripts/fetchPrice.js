const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ROXOM_API_URL = 'https://rtvapi.roxom.com/btc/info?apiKey=60be7d11-ec67-4ac0-9241-da1cbdcba73d';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parsePriceString(priceString) {
  // Extrae el precio de strings como "$100,533.13 \n -1452.14 [-1.42%]"
  const priceMatch = priceString.match(/\$([\d,]+\.?\d*)/);
  const changeMatch = priceString.match(/-?([\d,]+\.?\d*)\s*\[(-?\d+\.?\d*)%\]/);
  
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
  const change = changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : null;
  const changePercent = changeMatch ? parseFloat(changeMatch[2]) : null;
  
  return { price, change, changePercent };
}

async function fetchAndSavePrice() {
  try {
    console.log('🔄 Fetching Bitcoin price from Roxom API...');
    
    // Obtener datos de la API de Roxom
    const response = await axios.get(ROXOM_API_URL);
    const data = response.data;
    
    // Extraer información relevante
    const priceInfo = parsePriceString(data.price.live_price);
    const marketCap = data.price_.market_cap;
    const volume24h = data.trading.daily_btc_trading_vol;
    
    if (!priceInfo.price) {
      throw new Error('No se pudo extraer el precio de la respuesta');
    }
    
    console.log(`💰 Precio actual: $${priceInfo.price.toLocaleString()}`);
    console.log(`📈 Cambio: ${priceInfo.change ? priceInfo.change.toLocaleString() : 'N/A'} (${priceInfo.changePercent ? priceInfo.changePercent.toFixed(2) : 'N/A'}%)`);
    
    // Guardar en la tabla de histórico
    const { error: historyError } = await supabase
      .from('prices')
      .insert([{
        symbol: 'BTC',
        price: priceInfo.price,
        price_change: priceInfo.change,
        price_change_percent: priceInfo.changePercent,
        market_cap: marketCap,
        volume_24h: volume24h,
        source: 'roxom'
      }]);
    
    if (historyError) {
      console.error('❌ Error guardando histórico:', historyError);
    } else {
      console.log('✅ Histórico guardado correctamente');
    }
    
    // Actualizar precio actual (upsert)
    const { error: currentError } = await supabase
      .from('current_price')
      .upsert([{
        symbol: 'BTC',
        price: priceInfo.price,
        price_change: priceInfo.change,
        price_change_percent: priceInfo.changePercent,
        market_cap: marketCap,
        volume_24h: volume24h,
        last_updated: new Date().toISOString()
      }], { onConflict: 'symbol' });
    
    if (currentError) {
      console.error('❌ Error actualizando precio actual:', currentError);
    } else {
      console.log('✅ Precio actual actualizado');
    }
    
    // Verificar reglas y disparar alertas
    await checkAndTriggerAlerts(priceInfo.price, priceInfo.changePercent);
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en fetchAndSavePrice:', error.message);
  }
}

async function checkAndTriggerAlerts(currentPrice, currentChangePercent) {
  try {
    console.log('🔍 Verificando reglas de alerta...');
    
    // Obtener todas las reglas activas
    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('enabled', true);
    
    if (error) {
      console.error('Error obteniendo reglas:', error);
      return;
    }
    
    if (!rules || rules.length === 0) {
      console.log('ℹ️ No hay reglas activas para verificar');
      return;
    }
    
    console.log(`📋 Verificando ${rules.length} reglas activas...`);
    
    for (const rule of rules) {
      let shouldTrigger = false;
      let alertMessage = '';
      
      switch (rule.condition_type) {
        case 'price_above':
          if (currentPrice > rule.value) {
            shouldTrigger = true;
            alertMessage = `🚀 Bitcoin superó $${rule.value.toLocaleString()}! Precio actual: $${currentPrice.toLocaleString()}`;
          }
          break;
          
        case 'price_below':
          if (currentPrice < rule.value) {
            shouldTrigger = true;
            alertMessage = `📉 Bitcoin cayó por debajo de $${rule.value.toLocaleString()}! Precio actual: $${currentPrice.toLocaleString()}`;
          }
          break;
          
        case 'variation_up':
          if (currentChangePercent && currentChangePercent > rule.value) {
            shouldTrigger = true;
            alertMessage = `📈 Bitcoin subió ${currentChangePercent.toFixed(2)}% en las últimas 24h! (Regla: ${rule.value}%)`;
          }
          break;
          
        case 'variation_down':
          if (currentChangePercent && currentChangePercent < -rule.value) {
            shouldTrigger = true;
            alertMessage = `📉 Bitcoin cayó ${Math.abs(currentChangePercent).toFixed(2)}% en las últimas 24h! (Regla: ${rule.value}%)`;
          }
          break;
      }
      
      if (shouldTrigger) {
        console.log(`🚨 Disparando alerta para regla: ${rule.name}`);
        
        // Guardar alerta en la base de datos
        const { error: alertError } = await supabase
          .from('alerts_sent')
          .insert([{
            rule_id: rule.id,
            rule_name: rule.name,
            message: alertMessage,
            price: currentPrice,
            variation: currentChangePercent
          }]);
        
        if (alertError) {
          console.error('Error guardando alerta:', alertError);
        } else {
          console.log('✅ Alerta guardada en base de datos');
        }
        
        // Enviar webhook (si está configurado)
        if (rule.webhook_url) {
          await sendWebhook(rule.webhook_url, alertMessage, currentPrice, currentChangePercent);
        }
      }
    }
    
  } catch (error) {
    console.error('Error verificando alertas:', error);
  }
}

async function sendWebhook(webhookUrl, message, price, variation) {
  try {
    const payload = {
      text: message,
      price: price,
      variation: variation,
      timestamp: new Date().toISOString()
    };
    
    await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook enviado exitosamente');
  } catch (error) {
    console.error('❌ Error enviando webhook:', error.message);
  }
}

// Ejecutar el script
if (require.main === module) {
  fetchAndSavePrice();
}

module.exports = { fetchAndSavePrice, checkAndTriggerAlerts }; 