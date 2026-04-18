require('dotenv').config({ path: './.env' });
const { supabaseAdmin } = require('./config/database');

async function updateCollegesBangalore() {
  try {
    console.log('Updating colleges with Bangalore coordinates...');
    
    // First, let's see what colleges exist
    const { data: existingColleges, error: fetchError } = await supabaseAdmin
      .from('colleges')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching colleges:', fetchError);
      return;
    }
    
    console.log('Current colleges:', existingColleges.length);
    
    // Delete existing colleges to start fresh
    const { error: deleteError } = await supabaseAdmin
      .from('colleges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('Delete result:', deleteError);
    }
    
    // Insert new Bangalore colleges with proper coordinates
    const bangaloreColleges = [
      {
        name: 'RV College of Engineering',
        description: 'Premier engineering college in Bangalore offering quality education in various engineering streams.',
        location: 'Bangalore, Karnataka',
        address: 'RV Vidyaniketan Post, Mysore Road, Bangalore, Karnataka 560059',
        latitude: 12.9249, // RV College coordinates
        longitude: 77.4989,
        website: 'https://rvce.edu.in',
        phone: '080-67178000',
        email: 'info@rvce.edu.in',
        established_year: 1963,
        rating: 4.6,
        total_ratings: 200,
        is_verified: true,
        is_active: true
      },
      {
        name: 'PES University',
        description: 'Leading technical institute providing excellent education and placement opportunities.',
        location: 'Bangalore, Karnataka',
        address: '100 Feet Ring Road, BSK III Stage, Bangalore, Karnataka 560085',
        latitude: 12.9342,
        longitude: 77.5292,
        website: 'https://pes.edu',
        phone: '080-26721983',
        email: 'info@pes.edu',
        established_year: 1972,
        rating: 4.5,
        total_ratings: 180,
        is_verified: true,
        is_active: true
      },
      {
        name: 'BMS College of Engineering',
        description: 'Autonomous engineering college affiliated to VTU, known for excellence in technical education.',
        location: 'Bangalore, Karnataka',
        address: 'Bull Temple Road, Basavanagudi, Bangalore, Karnataka 560019',
        latitude: 12.9435,
        longitude: 77.5847,
        website: 'https://bmsce.ac.in',
        phone: '080-26613353',
        email: 'principal@bmsce.ac.in',
        established_year: 1946,
        rating: 4.4,
        total_ratings: 160,
        is_verified: true,
        is_active: true
      },
      {
        name: 'MS Ramaiah Institute of Technology',
        description: 'Prestigious engineering institute with state-of-the-art facilities and excellent faculty.',
        location: 'Bangalore, Karnataka',
        address: 'MSR Nagar, MSRIT Post, Bangalore, Karnataka 560054',
        latitude: 13.0294,
        longitude: 77.5594,
        website: 'https://msrit.edu',
        phone: '080-23600822',
        email: 'info@msrit.edu',
        established_year: 1962,
        rating: 4.3,
        total_ratings: 150,
        is_verified: true,
        is_active: true
      },
      {
        name: 'Dayananda Sagar College of Engineering',
        description: 'Well-established engineering college with modern infrastructure and industry connections.',
        location: 'Bangalore, Karnataka',
        address: 'Shavige Malleshwara Hills, Kumaraswamy Layout, Bangalore, Karnataka 560078',
        latitude: 12.9010,
        longitude: 77.5370,
        website: 'https://dsce.edu.in',
        phone: '080-28861729',
        email: 'info@dsce.edu.in',
        established_year: 1979,
        rating: 4.2,
        total_ratings: 140,
        is_verified: true,
        is_active: true
      }
    ];
    
    // Insert the new colleges
    const { data: insertedColleges, error: insertError } = await supabaseAdmin
      .from('colleges')
      .insert(bangaloreColleges)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting colleges:', insertError);
    } else {
      console.log('✅ Bangalore colleges created successfully:', insertedColleges.length);
      insertedColleges.forEach(college => {
        console.log(`  - ${college.name} (${college.latitude}, ${college.longitude})`);
      });
    }
    
    // Verify the colleges are properly inserted
    const { data: verifyColleges, error: verifyError } = await supabaseAdmin
      .from('colleges')
      .select('name, location, latitude, longitude, rating')
      .order('rating', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Error verifying colleges:', verifyError);
    } else {
      console.log('\n✅ Final verification - Colleges with coordinates:');
      verifyColleges.forEach(college => {
        console.log(`  - ${college.name}: (${college.latitude}, ${college.longitude}) - Rating: ${college.rating}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

updateCollegesBangalore();