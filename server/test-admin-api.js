require('dotenv').config({ path: './.env' });
const { supabaseAdmin } = require('./config/database');

async function testAdminAPI() {
  try {
    console.log('Testing admin API endpoints...');
    
    // Test top colleges endpoint
    console.log('1. Testing top colleges...');
    const { data: colleges, error: collegesError } = await supabaseAdmin
      .from('colleges')
      .select('*')
      .eq('is_verified', true)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(5);
    
    if (collegesError) {
      console.error('Colleges error:', collegesError);
    } else {
      console.log('✅ Colleges found:', colleges.length);
      colleges.forEach(college => {
        console.log(`  - ${college.name} (Rating: ${college.rating})`);
      });
    }
    
    // Test stats endpoint
    console.log('\n2. Testing stats...');
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .neq('role', 'super_admin');
    
    if (usersError) {
      console.error('Users error:', usersError);
    } else {
      console.log('✅ Users found:', users.length);
      const students = users.filter(u => u.role === 'student').length;
      const parents = users.filter(u => u.role === 'parent').length;
      const collegeAdmins = users.filter(u => u.role === 'college_admin').length;
      console.log(`  - Students: ${students}`);
      console.log(`  - Parents: ${parents}`);
      console.log(`  - College Admins: ${collegeAdmins}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAdminAPI();