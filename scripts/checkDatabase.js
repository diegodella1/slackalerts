const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTables() {
  console.log('🔍 Checking database tables...');

  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['rules', 'price_history', 'alerts_sent']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('📋 Existing tables:', existingTables);

    // Create tables if they don't exist
    const tablesToCreate = [];

    if (!existingTables.includes('rules')) {
      tablesToCreate.push(`
        CREATE TABLE rules (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          condition_type TEXT NOT NULL CHECK (condition_type IN ('price_above', 'price_below', 'variation_up', 'variation_down')),
          value DECIMAL NOT NULL,
          window_minutes INTEGER DEFAULT 5,
          message_template TEXT NOT NULL,
          webhook_url TEXT,
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    if (!existingTables.includes('price_history')) {
      tablesToCreate.push(`
        CREATE TABLE price_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          price DECIMAL NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          source TEXT DEFAULT 'roxom_api'
        );
      `);
    }

    if (!existingTables.includes('alerts_sent')) {
      tablesToCreate.push(`
        CREATE TABLE alerts_sent (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          rule_id UUID REFERENCES rules(id) ON DELETE CASCADE,
          triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          price_at_trigger DECIMAL NOT NULL,
          message TEXT NOT NULL,
          webhook_sent BOOLEAN DEFAULT false,
          webhook_response TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }

    if (tablesToCreate.length > 0) {
      console.log('🔨 Creating missing tables...');
      
      for (const createTableSQL of tablesToCreate) {
        const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (error) {
          console.error('❌ Error creating table:', error);
        } else {
          console.log('✅ Table created successfully');
        }
      }
    } else {
      console.log('✅ All tables already exist');
    }

    // Test inserting a price record
    console.log('🧪 Testing price history insertion...');
    const { error: insertError } = await supabase
      .from('price_history')
      .insert([{
        price: 65000.00,
        timestamp: new Date().toISOString(),
        source: 'test'
      }]);

    if (insertError) {
      console.error('❌ Error inserting test price:', insertError);
    } else {
      console.log('✅ Price history insertion test successful');
      
      // Clean up test data
      await supabase
        .from('price_history')
        .delete()
        .eq('source', 'test');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndCreateTables(); 