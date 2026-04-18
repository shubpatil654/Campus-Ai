const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use supabaseAdmin for admin routes to bypass RLS
    const client = req.originalUrl.includes('/admin') ? supabaseAdmin : supabase;

    // Get user from database
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      console.error('User lookup error:', error);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Use supabaseAdmin for admin routes to bypass RLS
      const client = req.originalUrl.includes('/admin') ? supabaseAdmin : supabase;
      
      const { data: user, error } = await client
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (!error && user) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't block the request
    }
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
