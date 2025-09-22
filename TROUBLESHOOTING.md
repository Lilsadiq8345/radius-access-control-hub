# 🔧 Troubleshooting Guide

This guide will help you fix common issues with the RADIUS Central Management System.

## 🚨 **Login Issues - "Users Can't Login"**

### **Problem**: Application stuck on "Loading..." screen

**Solution**:
1. **Check Browser Console** - Open Developer Tools (F12) and look for errors
2. **Database Tables Missing** - The most common cause is missing database tables
3. **Follow the Setup Steps Below**

### **Problem**: Authentication fails with database errors

**Solution**:
1. **Run Database Setup** - Use the Test Connection page to set up the database
2. **Manual SQL Setup** - Run the `database-setup.sql` script in Supabase

## 🗄️ **Database Setup**

### **Step 1: Automatic Setup (Recommended)**

1. **Navigate to Test Page**:
   - Go to `http://localhost:8080/test`
   - Click "Setup Database" button
   - Check the results for any errors

2. **Create Test Users**:
   - Click "Create Test Users" button
   - This will create admin and regular users for testing

### **Step 2: Manual SQL Setup**

If automatic setup fails, manually run the SQL script:

1. **Open Supabase Dashboard**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Setup Script**:
   - Copy the contents of `database-setup.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

3. **Verify Tables Created**:
   - Check that these tables exist:
     - `user_profiles`
     - `auth_logs`
     - `radius_servers`
     - `network_policies`
     - `radius_sessions`

## 👤 **Test User Credentials**

After setup, you can use these test credentials:

### **Admin User**
- **Email**: `admin@company.com`
- **Password**: `admin123`
- **Role**: Admin (full access)

### **Regular User**
- **Email**: `user@company.com`
- **Password**: `user123`
- **Role**: User (limited access)

### **Test User**
- **Email**: `test@company.com`
- **Password**: `test123`
- **Role**: User (limited access)

## 🔍 **Common Error Messages & Solutions**

### **Error**: "Module 'net' has been externalized for browser compatibility"

**Cause**: Node.js modules being used in browser code
**Solution**: ✅ **FIXED** - The RADIUS server code has been updated to be browser-compatible

### **Error**: "user_profiles table does not exist"

**Cause**: Database tables haven't been created
**Solution**: 
1. Run the database setup script
2. Check Supabase project settings
3. Verify RLS policies are configured

### **Error**: "Supabase connection failed"

**Cause**: Incorrect API credentials or network issues
**Solution**:
1. Check `src/integrations/supabase/client.ts`
2. Verify your Supabase URL and API key
3. Ensure your Supabase project is active

### **Error**: "Auth state changed: SIGNED_IN" but still loading

**Cause**: User profile creation failing
**Solution**: 
1. Check if `user_profiles` table exists
2. Verify RLS policies allow profile creation
3. Check browser console for specific errors

## 🛠️ **Debugging Steps**

### **Step 1: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for "Supabase connected successfully" message

### **Step 2: Test Database Connection**
1. Go to `/test` page
2. Click "Test Connection"
3. Review the results
4. Fix any issues identified

### **Step 3: Verify Supabase Configuration**
1. Check your Supabase project is active
2. Verify API credentials in `client.ts`
3. Ensure authentication is enabled
4. Check Row Level Security (RLS) policies

### **Step 4: Test User Creation**
1. Go to `/test` page
2. Click "Create Test Users"
3. Try logging in with test credentials
4. Check if user profiles are created

## 🔧 **Manual Database Verification**

### **Check Tables Exist**
Run this SQL in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'auth_logs', 'radius_servers', 'network_policies', 'radius_sessions');
```

### **Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **Check User Profiles**
```sql
SELECT id, full_name, email, role, status 
FROM user_profiles 
LIMIT 10;
```

## 🚀 **Quick Fix Checklist**

- [ ] **Database Tables Created** - Run `database-setup.sql`
- [ ] **RLS Policies Configured** - Check Supabase policies
- [ ] **Test Users Created** - Use the test page to create users
- [ ] **API Credentials Correct** - Verify Supabase URL and key
- [ ] **Authentication Enabled** - Check Supabase auth settings
- [ ] **Browser Console Clean** - No JavaScript errors
- [ ] **Network Connection** - Supabase accessible

## 📞 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the Console Logs** - Look for specific error messages
2. **Verify Supabase Project** - Ensure it's active and properly configured
3. **Test with Different Browser** - Try Chrome, Firefox, or Safari
4. **Clear Browser Cache** - Hard refresh (Ctrl+F5) or clear cache
5. **Check Network Tab** - Look for failed API requests

## 🎯 **Expected Behavior After Fix**

After successful setup, you should see:

1. **Login Page Loads** - No more "Loading..." screen
2. **Test Users Work** - Can login with provided credentials
3. **Dashboard Access** - Full application functionality
4. **No Console Errors** - Clean browser console
5. **Database Tables** - All required tables exist

## 🔄 **Reset Everything**

If you need to start fresh:

1. **Delete Supabase Project** - Create a new one
2. **Update Credentials** - Update `client.ts` with new credentials
3. **Run Setup Script** - Execute `database-setup.sql`
4. **Create Test Users** - Use the test page
5. **Test Login** - Verify everything works

---

**Need more help?** Check the main README.md for detailed setup instructions. 