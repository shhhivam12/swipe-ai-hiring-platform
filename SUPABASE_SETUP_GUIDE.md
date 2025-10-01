# 🗄️ Supabase Database Setup Guide

This guide will help you set up your Supabase database for the Swipe AI Interview Portal. Follow these steps to configure your database and get the application running with full data persistence.

## 📋 Prerequisites

- A Supabase account (free tier available)
- Basic understanding of SQL
- Your application code ready to deploy

## 🚀 Step 1: Create a Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Select your organization
   - Project Name: `swipe-ai-interview-portal`
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your users
5. **Click "Create new project"**
6. **Wait for setup** (usually takes 1-2 minutes)

## 🔧 Step 2: Get Your Project Credentials

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click on "API" tab**
3. **Copy these values:**
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## 📊 Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New Query"**
3. **Copy and paste the entire schema** from `database/schema.sql`
4. **Click "Run"** to execute the schema

### What the Schema Creates:

- **`jobs` table**: Stores job postings with custom questions
- **`students` table**: Stores candidate information
- **`interviews` table**: Stores interview data, scores, and results
- **Indexes**: For better query performance
- **Triggers**: For automatic timestamp updates
- **Sample data**: 3 example jobs

## 🔐 Step 4: Configure Row Level Security (Optional but Recommended)

For production use, enable Row Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Allow all operations for authenticated users" ON jobs
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON students
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON interviews
    FOR ALL USING (true);
```

## 📁 Step 5: Set Up File Storage (Optional)

If you want to store resume files in Supabase:

1. **Go to Storage** in your Supabase dashboard
2. **Create a new bucket:**
   - Name: `resumes`
   - Public: `false` (for security)
3. **Set up policies** for the bucket

## ⚙️ Step 6: Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend Environment Variables
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Step 7: Test Your Setup

1. **Start your application:**
   ```bash
   # Backend
   cd backend && python app.py
   
   # Frontend
   npm start
   ```

2. **Test the connection:**
   - Go to your app
   - Login as a student
   - Upload a resume
   - Complete an interview
   - Check your Supabase dashboard to see if data appears

## 📊 Step 8: Verify Data in Supabase

1. **Go to Table Editor** in your Supabase dashboard
2. **Check these tables:**
   - `students`: Should show candidate information
   - `interviews`: Should show interview records
   - `jobs`: Should show your job postings

## 🔍 Step 9: Monitor and Debug

### Check Logs:
- **Go to Logs** in your Supabase dashboard
- **Monitor API calls** and errors
- **Check for any permission issues**

### Common Issues:

1. **"Invalid API key" error:**
   - Double-check your SUPABASE_KEY
   - Make sure you're using the `anon` key, not the `service_role` key

2. **"Permission denied" error:**
   - Check your RLS policies
   - Ensure policies allow the operations you need

3. **"Table doesn't exist" error:**
   - Verify the schema was executed successfully
   - Check table names match exactly

## 🚀 Step 10: Production Considerations

### Security:
- Use Row Level Security (RLS) policies
- Never expose service role key in frontend
- Use environment variables for all secrets

### Performance:
- Add indexes for frequently queried columns
- Use connection pooling for high traffic
- Monitor query performance

### Backup:
- Enable automatic backups in Supabase
- Export data regularly
- Test restore procedures

## 📈 Step 11: Advanced Features

### Real-time Subscriptions:
```javascript
// Subscribe to interview updates
const subscription = supabase
  .channel('interviews')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'interviews' },
    (payload) => console.log('Interview updated:', payload)
  )
  .subscribe()
```

### Custom Functions:
```sql
-- Create a function to get candidate statistics
CREATE OR REPLACE FUNCTION get_candidate_stats(job_id UUID)
RETURNS TABLE (
  total_candidates BIGINT,
  average_score NUMERIC,
  shortlisted_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_candidates,
    AVG(i.final_score) as average_score,
    COUNT(*) FILTER (WHERE i.status = 'shortlisted') as shortlisted_count
  FROM interviews i
  WHERE i.job_id = $1;
END;
$$ LANGUAGE plpgsql;
```

## 🆘 Troubleshooting

### Database Connection Issues:
```bash
# Test connection from backend
python -c "
import os
from supabase import create_client
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)
print('Connection successful!')
"
```

### Frontend Connection Issues:
```javascript
// Test in browser console
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
)
console.log('Supabase client created:', supabase)
```

## 📞 Support

If you encounter issues:

1. **Check Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
2. **Join Supabase Discord**: For community support
3. **Check Application Logs**: Both frontend and backend
4. **Verify Environment Variables**: All required variables are set

## ✅ Final Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Application connects to database
- [ ] Data persists correctly
- [ ] Email notifications work
- [ ] File uploads work (if using storage)
- [ ] RLS policies configured (for production)

## 🎉 You're Ready!

Your Swipe AI Interview Portal is now fully configured with Supabase! The application will:

- ✅ Store all interview data persistently
- ✅ Send email notifications
- ✅ Handle file uploads
- ✅ Provide real-time updates
- ✅ Scale with your needs

**Next Steps:**
1. Test all features thoroughly
2. Deploy to production
3. Monitor performance
4. Add more custom features as needed

Happy hiring! 🚀
