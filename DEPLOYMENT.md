# 🚀 Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
1. GitHub account
2. Vercel account (free tier available)
3. Supabase project set up

### Step 1: Prepare Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/CampusAI.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your CampusAI repository

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Root Directory: `./` (leave empty)
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

### Step 3: Environment Variables

Set these environment variables in Vercel Dashboard:

#### Server Environment Variables
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-app-name.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Client Environment Variables
```
REACT_APP_API_URL=https://your-app-name.vercel.app/api
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

### Step 4: Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down your project URL and keys

2. **Run Database Scripts**
   In Supabase SQL Editor, run these files in order:
   ```sql
   -- 1. First run setup-database.sql
   -- 2. Then run create-admin-user.sql
   -- 3. Run other SQL files as needed
   ```

### Step 5: Verify Deployment

1. **Check Frontend**
   - Visit `https://your-app-name.vercel.app`
   - Test college search functionality
   - Test user registration/login

2. **Check Admin Panel**
   - Visit `https://your-app-name.vercel.app/admin-login`
   - Login with: `admin@campusai.com` / `admin123`
   - Test all admin features

3. **Check API**
   - Visit `https://your-app-name.vercel.app/api/colleges`
   - Should return JSON with college data

---

**Need Help?** Create an issue in the GitHub repository with your deployment logs.