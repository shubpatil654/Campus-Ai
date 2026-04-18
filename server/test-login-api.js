require('dotenv').config({ path: './.env' });
const { supabase, supabaseAdmin } = require('./config/database');
const bcrypt = require('bcryptjs');

async function testLoginAPI() {
  try {
    console.log('Testing login API...');
    
    // Test the exact same flow as the login route
    const email = 'admin@campusai.com';
    const password = 'admin123';
    
    console.log('1. Checking if user exists with regular client...');
    const { data: user1, error: error1 } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error1) {
      console.log('Regular client error:', error1);
    } else {
      console.log('✅ User found with regular client:', user1.email);
    }
    
    console.log('2. Checking if user exists with admin client...');
    const { data: user2, error: error2 } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error2) {
      console.log('Admin client error:', error2);
      return;
    }

    console.log('✅ User found with admin client:', {
      id: user2.id,
      name: user2.name,
      email: user2.email,
      role: user2.role,
      is_verified: user2.is_verified
    });

    console.log('3. Testing password...');
    const isMatch = await bcrypt.compare(password, user2.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
      console.log('✅ Login should work with these credentials:');
      console.log('   Email: admin@campusai.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Password does not match');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testLoginAPI();