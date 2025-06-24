const { createClient } = require('@supabase/supabase-js');

// Test script to verify the setup
async function testSetup() {
  console.log('🧪 Testing Bitcoin Price Alert System Setup...\n');

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  console.log('📋 Checking environment variables...');
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
    }
  }

  // Test Supabase connection
  console.log('\n🔗 Testing Supabase connection...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test database connection
    const { data, error } = await supabase
      .from('rules')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
    } else {
      console.log('✅ Database connection successful');
    }

    // Check if tables exist
    console.log('\n📊 Checking database tables...');
    const tables = ['rules', 'alerts_sent', 'price_history'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Supabase connection failed: ${error.message}`);
  }

  // Test API endpoint
  console.log('\n🌐 Testing API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/fetch-price', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint accessible');
      console.log(`📈 Latest price: $${data.price?.toLocaleString() || 'N/A'}`);
    } else {
      console.log(`❌ API endpoint failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ API endpoint test failed: ${error.message}`);
    console.log('💡 Make sure the development server is running (npm run dev)');
  }

  console.log('\n📝 Setup Summary:');
  console.log('1. Run the SQL commands in database_schema_updates.sql in your Supabase SQL Editor');
  console.log('2. Configure your environment variables in .env.local');
  console.log('3. Start the development server: npm run dev');
  console.log('4. Test the application by visiting http://localhost:3000');
  console.log('5. Create rules and test the alert system');
  
  console.log('\n🎉 Setup test completed!');
}

// Run the test
testSetup().catch(console.error); 