# 🚀 Quick Start Guide

This guide will help you get the RADIUS Central Management System running in minutes.

## ⚡ **Quick Setup (5 minutes)**

### **Step 1: Start the Application**
```bash
npm run dev
```
The app will start at `http://localhost:8080`

### **Step 2: Set Up Database**
1. **Go to the Test Page**: Navigate to `http://localhost:8080/test`
2. **Click "Test Connection"** - This will check your current setup
3. **If tables are missing**: Follow the setup instructions shown

### **Step 3: Manual Database Setup (if needed)**
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the contents of `database-setup.sql`
4. Paste and **Run** the script
5. Return to the test page and verify

### **Step 4: Create Test Users**
1. On the test page, click **"Create Test Users"**
2. This creates admin and regular users for testing

### **Step 5: Test Login**
Use these credentials to test:
- **Admin**: `admin@radiuscorp.com` / `admin123`
- **User**: `user@radiuscorp.com` / `user123`
- **Test**: `test@radiuscorp.com` / `test123`

## 🔧 **Troubleshooting**

### **Problem**: "Loading..." screen
**Solution**: 
1. Check browser console (F12) for errors
2. Go to `/test` page and run diagnostics
3. Ensure database tables exist

### **Problem**: Can't login
**Solution**:
1. Verify Supabase credentials in `src/integrations/supabase/client.ts`
2. Check that authentication is enabled in Supabase
3. Run the database setup script

### **Problem**: Database errors
**Solution**:
1. Run `database-setup.sql` in Supabase SQL Editor
2. Check RLS policies are configured
3. Verify API permissions

## 📋 **What's Fixed**

✅ **React Navigation Warning** - Fixed render-time navigation issues
✅ **Database Setup** - Added comprehensive database checking
✅ **Authentication Flow** - Improved error handling and fallbacks
✅ **Loading States** - Better loading state management
✅ **Test Tools** - Enhanced testing and diagnostics

## 🎯 **Expected Results**

After setup, you should see:
- ✅ Login page loads properly
- ✅ Users can register and login
- ✅ Dashboard works with full functionality
- ✅ No browser console errors
- ✅ All RADIUS management features available

## 🆘 **Need Help?**

1. **Check the console** - Look for error messages
2. **Use the test page** - `/test` has comprehensive diagnostics
3. **Read TROUBLESHOOTING.md** - Detailed troubleshooting guide
4. **Verify Supabase setup** - Ensure project is active and configured

---

**Ready to go!** 🎉 The application should now work perfectly for user registration, login, and RADIUS management. 