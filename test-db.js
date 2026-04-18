const { supabase } = require('./config/database');

async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if otps table exists
    const { data: otpsData, error: otpsError } = await supabase
      .from('otps')
      .select('count')
      .limit(1);
    
    if (otpsError) {
      console.log('❌ otps table does not exist:', otpsError.message);
      console.log('📋 Please run the create-otp-tables.sql script in your Supabase dashboard');
    } else {
      console.log('✅ otps table exists and is accessible');
    }
    
    // Check if temp_users table exists
    const { data: tempUsersData, error: tempUsersError } = await supabase
      .from('temp_users')
      .select('count')
      .limit(1);
    
    if (tempUsersError) {
      console.log('❌ temp_users table does not exist:', tempUsersError.message);
      console.log('📋 Please run the create-otp-tables.sql script in your Supabase dashboard');
    } else {
      console.log('✅ temp_users table exists and is accessible');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabase();
