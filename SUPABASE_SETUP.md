# Supabase Setup Guide for CampusAI

## 🚀 Quick Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `campus-ai`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 3: Set Up Environment Variables

1. Create a `.env` file in the root directory:
```bash
# Database Configuration
SUPABASE_URL=https://kqyrvlldcymscsxmlfjt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeXJ2bGxkY3ltc2NzeG1sZmp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMTY3MDMsImV4cCI6MjA4ODY5MjcwM30.awfFecTQxs8PwgYpn7Lpw3AtFZCnAzDBj42SbftkccE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeXJ2bGxkY3ltc2NzeG1sZmp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzExNjcwMywiZXhwIjoyMDg4NjkyNzAzfQ.BnDBO4bd324947KGL-PNZBLIy7Rq3Kt4nYmFGoKywaw
# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Maps & Location Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Authentication & Security
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

### Step 5: Test the Setup

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm start
```

3. Visit `http://localhost:3000` and test:
   - Registration/Login
   - College search
   - Adding favorites
   - Viewing college details

## 📊 Database Schema Overview

The database includes the following tables:

### Core Tables
- **users** - User accounts and profiles
- **colleges** - College information and details
- **courses** - Course offerings by colleges
- **hostels** - Hostel facilities and availability
- **scholarships** - Scholarship information

### User Interaction Tables
- **user_favorites** - User's favorite colleges
- **chat_messages** - AI chatbot conversations
- **college_reviews** - User reviews and ratings
- **subscriptions** - User subscription plans
- **user_activity_log** - User activity tracking

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **JWT Authentication** for API access
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** on API endpoints

## 📝 Sample Data

The schema includes sample data for testing:
- 3 demo users (student, parent, admin)
- 3 colleges in Belagavi
- Sample courses, hostels, and scholarships

## 🧪 Testing Credentials

Use these demo accounts to test the application:

```
Student: student@demo.com / password123
Parent: parent@demo.com / password123
Admin: admin@campusai.com / admin123
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Ensure your `.env` file has all required Supabase keys
   - Check that the keys are correct and not truncated

2. **"Database connection failed"**
   - Verify your Supabase project is active
   - Check your internet connection
   - Ensure the schema has been executed

3. **"Authentication failed"**
   - Verify JWT_SECRET is set in your `.env`
   - Check that the database schema was executed properly

4. **"No colleges found"**
   - Ensure the sample data was inserted
   - Check that colleges have `is_active = true`

### Getting Help:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the database schema was executed successfully
4. Test the Supabase connection in the dashboard

## 🚀 Next Steps

After successful setup:

1. **Add Real College Data** - Replace sample data with actual colleges
2. **Configure AI Chatbot** - Set up OpenAI API for chatbot functionality
3. **Add Payment Integration** - Configure Razorpay for subscriptions
4. **Deploy to Production** - Set up hosting and domain

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the server logs for error details
3. Verify your Supabase project settings
4. Ensure all environment variables are correctly set
