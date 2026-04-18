const { supabase } = require('../config/database');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Supabase
const storeOTP = async (email, otp) => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const { data, error } = await supabase
      .from('otps')
      .upsert([
        {
          email: email,
          otp: otp,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }
      ], {
        onConflict: 'email'
      });

    if (error) {
      console.error('Supabase store OTP error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Store OTP error:', error);
    return false;
  }
};

// Get OTP for verification
const getOTP = async (email) => {
  try {
    const { data, error } = await supabase
      .from('otps')
      .select('otp, expires_at')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      // OTP expired, delete it
      await deleteOTP(email);
      return null;
    }

    return data.otp;
  } catch (error) {
    console.error('Get OTP error:', error);
    return null;
  }
};

// Delete OTP after successful verification
const deleteOTP = async (email) => {
  try {
    const { error } = await supabase
      .from('otps')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Supabase delete OTP error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete OTP error:', error);
    return false;
  }
};

// Store temporary user data during registration
const storeTempUser = async (email, userData) => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const { data, error } = await supabase
      .from('temp_users')
      .upsert([
        {
          email: email,
          user_data: userData,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }
      ], {
        onConflict: 'email'
      });

    if (error) {
      console.error('Supabase store temp user error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Store temp user error:', error);
    return false;
  }
};

// Get temporary user data
const getTempUser = async (email) => {
  try {
    const { data, error } = await supabase
      .from('temp_users')
      .select('user_data, expires_at')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if data has expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      // Data expired, delete it
      await deleteTempUser(email);
      return null;
    }

    return data.user_data;
  } catch (error) {
    console.error('Get temp user error:', error);
    return null;
  }
};

// Delete temporary user data
const deleteTempUser = async (email) => {
  try {
    const { error } = await supabase
      .from('temp_users')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Supabase delete temp user error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete temp user error:', error);
    return false;
  }
};

// Clean up expired OTPs and temp users (can be called periodically)
const cleanupExpiredData = async () => {
  try {
    const now = new Date().toISOString();
    
    // Delete expired OTPs
    const { error: otpError } = await supabase
      .from('otps')
      .delete()
      .lt('expires_at', now);

    if (otpError) {
      console.error('Cleanup expired OTPs error:', otpError);
    }

    // Delete expired temp users
    const { error: userError } = await supabase
      .from('temp_users')
      .delete()
      .lt('expires_at', now);

    if (userError) {
      console.error('Cleanup expired temp users error:', userError);
    }

    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

module.exports = {
  generateOTP,
  storeOTP,
  getOTP,
  deleteOTP,
  storeTempUser,
  getTempUser,
  deleteTempUser,
  cleanupExpiredData
};
