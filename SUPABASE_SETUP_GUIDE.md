# 🚀 **Complete Supabase Setup Guide**

This guide will walk you through setting up a new Supabase instance and connecting it to your RADIUS Central Management System.

## 📋 **Prerequisites**

- A Supabase account (free tier available)
- Basic knowledge of SQL
- Access to your project files

## 🔧 **Step 1: Create New Supabase Project**

### **1.1 Sign Up/Login to Supabase**
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Sign in with GitHub, Google, or create an account

### **1.2 Create New Project**
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `radius-central-system` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

### **1.3 Get Project Credentials**
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...`)

## 🗄️ **Step 2: Database Setup**

### **2.1 Run Database Schema**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database-setup.sql`
3. Click "Run" to execute the script
4. Verify all tables are created successfully

### **2.2 Create Admin User**
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Fill in:
   - **Email**: `admin@company.com`
   - **Password**: `admin`
   - **User Metadata**: Leave empty
4. Click "Add User"
5. Go back to **SQL Editor**
6. Run the `create-admin-user-simple.sql` script

## 🔐 **Step 3: Update Application Configuration**

### **3.1 Update Environment Variables**
1. Copy `.env.example` to `.env`
2. Update these values:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# RADIUS Server Configuration
RADIUS_SECRET=your-radius-secret-here
RADIUS_PORT=1812
API_PORT=3001

# Database Configuration (if using local PostgreSQL)
DB_USER=postgres
DB_PASSWORD=your-db-password
```

### **3.2 Update Supabase Client**
1. Open `src/integrations/supabase/client.ts`
2. Replace the placeholder values:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key-here";
```

### **3.3 Update Types (Optional but Recommended)**
1. Go to **Settings** → **API** in Supabase
2. Click "Generate types"
3. Copy the generated types
4. Replace `src/integrations/supabase/types.ts` content

## 🚀 **Step 4: Test Connection**

### **4.1 Start the Application**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **4.2 Test Admin Login**
1. Navigate to `http://localhost:3000/login`
2. Login with:
   - **Email**: `admin@company.com`
   - **Password**: `admin`
3. You should see the admin dashboard

## 🔧 **Step 5: Configure Authentication**

### **5.1 Set Up Auth Providers**
1. Go to **Authentication** → **Providers**
2. Configure providers as needed:
   - **Email**: Enabled by default
   - **Google**: Optional
   - **GitHub**: Optional

### **5.2 Configure Email Templates**
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### **5.3 Set Up RLS Policies**
The database setup script includes basic RLS policies, but you may want to customize them:

```sql
-- Example: Custom RLS policy for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🐳 **Step 6: Docker Deployment (Optional)**

### **6.1 Update Docker Environment**
1. Update `docker-compose.yml` environment variables
2. Update `.env` file with production values

### **6.2 Deploy**
```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔍 **Step 7: Verification & Testing**

### **7.1 Test Database Connection**
1. Go to **Table Editor** in Supabase
2. Verify tables exist:
   - `user_profiles`
   - `auth_logs`
   - `radius_servers`
   - `network_policies`
   - `radius_sessions`

### **7.2 Test Admin Functions**
1. Login as admin
2. Test user management
3. Test RADIUS server management
4. Test system monitoring

### **7.3 Test API Endpoints**
1. Check Supabase logs for errors
2. Test authentication flows
3. Verify RLS policies work correctly

## 🚨 **Common Issues & Solutions**

### **Issue: "Table doesn't exist" Error**
**Solution**: Run the database setup script again

### **Issue: Authentication fails**
**Solution**: 
1. Check environment variables
2. Verify Supabase URL and keys
3. Check RLS policies

### **Issue: Admin user not working**
**Solution**:
1. Verify user exists in `auth.users`
2. Check user profile in `user_profiles`
3. Ensure role is set to 'admin'

### **Issue: RLS policies blocking access**
**Solution**:
1. Check policy definitions
2. Verify user roles
3. Test with service role key temporarily

## 🔒 **Security Best Practices**

### **1. Environment Variables**
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate keys regularly

### **2. RLS Policies**
- Always enable RLS on sensitive tables
- Test policies thoroughly
- Use principle of least privilege

### **3. API Keys**
- Keep service role key secure
- Use anon key for client applications
- Monitor API usage

### **4. Database Access**
- Use connection pooling in production
- Implement rate limiting
- Monitor for suspicious activity

## 📊 **Monitoring & Maintenance**

### **1. Database Monitoring**
- Monitor query performance
- Check storage usage
- Review slow queries

### **2. Authentication Monitoring**
- Monitor failed login attempts
- Review user activity
- Check for suspicious patterns

### **3. Backup Strategy**
- Enable automatic backups
- Test restore procedures
- Document recovery processes

## 🎯 **Next Steps**

After successful setup:

1. **Customize the system** for your needs
2. **Add more users** and configure roles
3. **Set up monitoring** and alerting
4. **Configure backup** schedules
5. **Test disaster recovery** procedures
6. **Document procedures** for your team

## 📞 **Support**

If you encounter issues:

1. Check Supabase documentation
2. Review application logs
3. Check Supabase dashboard for errors
4. Verify all configuration steps
5. Test with minimal configuration first

---

**🎉 Congratulations!** You now have a fully functional RADIUS Central Management System connected to your Supabase instance.
