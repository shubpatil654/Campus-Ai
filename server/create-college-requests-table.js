require('dotenv').config({ path: './.env' });
const { supabaseAdmin } = require('./config/database');

async function createCollegeRequestsTable() {
  try {
    console.log('Creating college_requests table...');
    
    // Create the table
    const { data: createResult, error: createError } = await supabaseAdmin
      .from('college_requests')
      .select('*')
      .limit(1);
    
    if (createError && createError.code === 'PGRST205') {
      console.log('Table does not exist, creating it...');
      
      // Insert sample data to create the table structure
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('college_requests')
        .insert([
          {
            college_name: 'New Engineering College',
            contact_person: 'Dr. John Smith',
            email: 'admin@newengcollege.edu',
            phone: '9876543210',
            website: 'https://newengcollege.edu',
            address: '123 Education Street',
            city: 'Bangalore',
            state: 'Karnataka',
            established_year: 2020,
            description: 'A new engineering college focusing on modern technology and innovation.',
            status: 'pending'
          },
          {
            college_name: 'Tech Institute of Excellence',
            contact_person: 'Prof. Sarah Johnson',
            email: 'contact@techexcellence.edu',
            phone: '9876543211',
            website: 'https://techexcellence.edu',
            address: '456 Tech Avenue',
            city: 'Pune',
            state: 'Maharashtra',
            established_year: 2019,
            description: 'Institute specializing in computer science and information technology.',
            status: 'pending'
          }
        ])
        .select();
      
      if (insertError) {
        console.error('❌ Error creating sample data:', insertError);
      } else {
        console.log('✅ Sample college requests created:', insertData.length);
      }
    } else if (createError) {
      console.error('❌ Error checking table:', createError);
    } else {
      console.log('✅ Table already exists with', createResult.length, 'records');
    }
    
    // Verify the table works
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('college_requests')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Error verifying table:', verifyError);
    } else {
      console.log('✅ College requests table verified:', verifyData.length, 'records');
      verifyData.forEach(request => {
        console.log(`  - ${request.college_name} (${request.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createCollegeRequestsTable();