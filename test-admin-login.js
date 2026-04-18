require('dotenv').config({ path: './server/.env' });
const { supabase } = require('./server/config/database');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Check if admin user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@campusai.com')
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (!user) {
      console.log('❌ Admin user not found in database');
      return;
    }

    console.log('✅ Admin user found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    });

    // Test password
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does not match');
      
      // Generate new hash for admin123
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash for admin123:', newHash);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAdminLogin();