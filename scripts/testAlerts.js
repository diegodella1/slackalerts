const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestRule() {
  try {
    // Crear una regla de prueba que se active fácilmente
    const { data, error } = await supabase
      .from('rules')
      .insert([
        {
          name: 'Test Rule - Price Above 1000',
          description: 'Test rule to trigger when price goes above $1000',
          condition_type: 'price_above',
          value: 1000,
          enabled: true,
          webhook_url: 'https://hooks.slack.com/services/YOUR_WEBHOOK_URL', // Reemplazar con tu webhook
          user_id: null // Para reglas globales
        }
      ])
      .select();

    if (error) {
      console.error('Error creating test rule:', error);
    } else {
      console.log('✅ Test rule created successfully:', data[0]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createTestPrice() {
  try {
    // Crear un precio de prueba que active la regla
    const testPrice = 1500; // Precio que supera los $1000
    
    const { data, error } = await supabase
      .from('prices')
      .insert([
        {
          symbol: 'BTC',
          price: testPrice,
          price_change: 500,
          price_change_percent: 50,
          market_cap: '$1,000,000,000',
          volume_24h: '$100,000,000',
          source: 'test'
        }
      ])
      .select();

    if (error) {
      console.error('Error creating test price:', error);
    } else {
      console.log('✅ Test price created successfully:', data[0]);
    }

    // Actualizar precio actual
    const { error: currentError } = await supabase
      .from('current_price')
      .upsert([
        {
          symbol: 'BTC',
          price: testPrice,
          price_change: 500,
          price_change_percent: 50,
          market_cap: '$1,000,000,000',
          volume_24h: '$100,000,000',
          last_updated: new Date().toISOString()
        }
      ], { onConflict: 'symbol' });

    if (currentError) {
      console.error('Error updating current price:', currentError);
    } else {
      console.log('✅ Current price updated successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listRules() {
  try {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rules:', error);
    } else {
      console.log('📋 Current rules:');
      data.forEach(rule => {
        console.log(`- ${rule.name} (${rule.condition_type}: ${rule.value}) - ${rule.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listAlerts() {
  try {
    const { data, error } = await supabase
      .from('alerts_sent')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      console.log('🔔 Recent alerts:');
      data.forEach(alert => {
        console.log(`- ${alert.message} (${new Date(alert.created_at).toLocaleString()})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  console.log('🚀 Starting test script...\n');
  
  console.log('1. Listing current rules...');
  await listRules();
  console.log('');
  
  console.log('2. Creating test rule...');
  await createTestRule();
  console.log('');
  
  console.log('3. Creating test price...');
  await createTestPrice();
  console.log('');
  
  console.log('4. Listing recent alerts...');
  await listAlerts();
  console.log('');
  
  console.log('✅ Test script completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to /price and start auto refresh');
  console.log('2. Create a rule with a low threshold (e.g., price above $1)');
  console.log('3. Watch for real-time alerts when conditions are met');
  console.log('4. Check your Slack webhook for notifications');
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createTestRule,
  createTestPrice,
  listRules,
  listAlerts
}; 