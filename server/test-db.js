require('dotenv').config({ path: './.env' });
const { supabase } = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test colleges
    const { data: colleges, error: collegeError } = await supabase
      .from('colleges')
      .select('name, courses(name, fees)')
      .ilike('name', '%jain%');
    
    if (collegeError) {
      console.error('College query error:', collegeError);
    } else {
      console.log('Jain colleges found:', JSON.stringify(colleges, null, 2));
    }
    
    // Test all colleges
    const { data: allColleges, error: allError } = await supabase
      .from('colleges')
      .select('name')
      .limit(5);
    
    if (allError) {
      console.error('All colleges query error:', allError);
    } else {
      console.log('Sample colleges:', JSON.stringify(allColleges, null, 2));
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDatabase();