require('dotenv').config({ path: './.env' });
const { supabaseAdmin } = require('./config/database');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, check what tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Available tables:', tables.map(t => t.table_name));
    }
    
    // Try to create users table first
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'student',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createTableQuery 
    });
    
    if (createError) {
      console.log('Table creation result:', createError);
    } else {
      console.log('✅ Users table created/verified');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated password hash:', hashedPassword);
    
    // Delete existing admin user
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('email', 'admin@campusai.com');
    
    if (deleteError) {
      console.log('Delete result (might be normal if user doesn\'t exist):', deleteError);
    }
    
    // Insert admin user
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: 'Admin User',
          email: 'admin@campusai.com',
          password: hashedPassword,
          phone: '1234567892',
          role: 'super_admin',
          is_verified: true
        }
      ])
      .select();
    
    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
    } else {
      console.log('✅ Admin user created successfully:', insertData);
    }
    
    // Verify the user was created
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@campusai.com')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying admin user:', verifyError);
    } else {
      console.log('✅ Admin user verified:', {
        id: verifyData.id,
        name: verifyData.name,
        email: verifyData.email,
        role: verifyData.role,
        is_verified: verifyData.is_verified
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createAdminUser();