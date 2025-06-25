const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please create a .env.local file with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewFeatures() {
  console.log('🚀 Testing New Features: Webhooks & Refresh Settings\n');

  // Test 1: Check if new tables exist
  console.log('1. Checking database schema...');
  try {
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('count')
      .limit(1);
    
    const { data: refreshSettings, error: refreshError } = await supabase
      .from('refresh_settings')
      .select('count')
      .limit(1);

    if (webhooksError) {
      console.log('❌ Webhooks table not found. Run the SQL script: webhook_and_refresh_setup.sql');
    } else {
      console.log('✅ Webhooks table exists');
    }

    if (refreshError) {
      console.log('❌ Refresh settings table not found. Run the SQL script: webhook_and_refresh_setup.sql');
    } else {
      console.log('✅ Refresh settings table exists');
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }

  // Test 2: Test webhook creation
  console.log('\n2. Testing webhook creation...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('ℹ️  Not authenticated. Skipping webhook tests.');
    } else {
      const testWebhook = {
        user_id: user.id,
        name: 'Test Webhook',
        url: 'https://hooks.slack.com/services/test/test/test',
        type: 'slack',
        is_active: true
      };

      const { data, error } = await supabase
        .from('webhooks')
        .insert(testWebhook)
        .select()
        .single();

      if (error) {
        console.log('ℹ️  Webhook creation test:', error.message);
      } else {
        console.log('✅ Webhook created successfully');
        
        // Clean up test webhook
        await supabase
          .from('webhooks')
          .update({ is_active: false })
          .eq('id', data.id);
      }
    }
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }

  // Test 3: Test refresh settings
  console.log('\n3. Testing refresh settings...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('ℹ️  Not authenticated. Skipping refresh settings tests.');
    } else {
      const { data, error } = await supabase
        .from('refresh_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('ℹ️  Refresh settings test:', error.message);
      } else if (data) {
        console.log(`✅ Refresh settings found: ${data.refresh_interval_seconds} seconds`);
      } else {
        console.log('ℹ️  No refresh settings found (will be created on first use)');
      }
    }
  } catch (error) {
    console.error('❌ Refresh settings test failed:', error.message);
  }

  // Test 4: Test price fetch API
  console.log('\n4. Testing price fetch API...');
  try {
    const response = await fetch('http://localhost:3000/api/fetch-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Price fetch API working');
      console.log(`   Current price: $${data.price?.toLocaleString() || 'N/A'}`);
      console.log(`   Change: ${data.changePercent ? data.changePercent.toFixed(2) + '%' : 'N/A'}`);
    } else {
      console.log('ℹ️  Price fetch API test:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('ℹ️  Price fetch API test (server not running):', error.message);
  }

  console.log('\n🎉 Feature testing complete!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script: webhook_and_refresh_setup.sql in Supabase');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Visit /settings to configure webhooks and refresh rates');
  console.log('4. Create rules and select webhooks for notifications');
}

testNewFeatures().catch(console.error); 