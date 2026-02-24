# CivicCare Setup Guide

## 🚀 Complete Installation & Setup Instructions

### System Requirements
- Node.js v16 or higher
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Step 1: MongoDB Setup

#### Option A: Local MongoDB
```bash
# Windows - Download from mongodb.com
# Mac - Install via Homebrew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and login
3. Create new cluster (free tier available)
4. Get connection string
5. Add your IP address to whitelist
6. Update MONGODB_URI in backend/.env

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with configuration
# Content should be:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/civiccare
# JWT_SECRET=your_jwt_secret_key_change_this_in_production
# JWT_EXPIRE=7d
# NODE_ENV=development
# ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Seed sample data
npm run seed

# Start backend server (development mode with auto-reload)
npm run dev

# Server will start on http://localhost:5000
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
# Content should be:
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start frontend development server
npm run dev

# Application will open on http://localhost:5173
```

### Step 4: Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/health
   # Expected response: {"success": true, "message": "Server is running"}
   ```

2. **Frontend Loading**
   Open http://localhost:5173 in browser
   You should see the CivicCare landing page

3. **Test Login**
   - Use credentials from seed data
   - Try citizen and admin logins

### 🧪 Testing the Application

#### As a Citizen:
1. Click "Register as Citizen" or go to /register
2. Fill in details:
   - Name: John Doe
   - Email: johndoe@example.com
   - Phone: 9876543210 (must be 10 digits)
   - Password: password123
3. Click Register
4. You'll be logged in automatically
5. Go to "Raise Complaint"
6. Fill complaint form and submit
7. Go to "My Complaints" to view

#### As an Admin:
1. Click "Admin Login" or go to /admin-login
2. Use admin credentials (from seed data):
   - Email: admin.waste@civiccare.com
   - Password: admin123
3. You'll see the admin dashboard
4. View complaints for your department
5. Click "Assign" to assign to a team
6. Click "Escalate" to escalate to ward office

### 📊 Real-Time Features Test

1. Open two browser windows:
   - Window 1: Admin dashboard (logged in as admin)
   - Window 2: My complaints (logged in as citizen)

2. In citizen window:
   - Raise a new complaint
   - Check admin window - complaint should appear instantly

3. In admin window:
   - Assign the complaint to a team
   - Check citizen window - notification should appear
   - Status should update in real-time

### 🔧 Troubleshooting

**Port 5000 already in use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in backend/.env
```

**Port 5173 already in use**
```bash
# Find process using port 5173
lsof -i :5173

# Or Vite will use 5174 automatically
```

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
# Mac: brew services list
# Windows: Check Services panel

# Try connection string with different formats:
# Local: mongodb://localhost:27017/civiccare
# With auth: mongodb://username:password@host:port/database

# For Atlas, ensure:
# 1. IP whitelist includes your IP
# 2. Database user has correct password
# 3. Connection string is correct
```

**npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**React/Vite build errors**
```bash
# Clear Vite cache
rm -rf frontend/node_modules/.vite

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### 📱 Testing on Mobile/Different Device

1. **Find your machine's IP**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Update environment variables**
   - Backend: Update ALLOWED_ORIGINS in .env
   - Frontend: Update VITE_API_URL to use IP

3. **Access from other device**
   ```
   http://<your-ip>:5173
   ```

### 🚀 Production Deployment

#### Backend (Heroku example):
```bash
# Create Heroku app
heroku create civiccare-backend

# Set environment variables
heroku config:set PORT=5000
heroku config:set MONGODB_URI=<mongodb-atlas-uri>
heroku config:set JWT_SECRET=<random-secret>
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Frontend (Vercel example):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
VITE_API_URL=https://civiccare-backend.herokuapp.com/api
VITE_SOCKET_URL=https://civiccare-backend.herokuapp.com
```

### 📚 API Testing with Postman

1. **Import API routes**
   - Create new Postman collection
   - Add requests for each endpoint

2. **Set up environment variables**
   ```json
   {
     "api_url": "http://localhost:5000/api",
     "token": "",
     "user_id": ""
   }
   ```

3. **Test workflow**
   ```
   1. POST /auth/register - Create user, save token
   2. POST /auth/login - Login, save token
   3. POST /complaints - Create complaint
   4. GET /complaints/user/:userId - Get complaints
   5. POST /admin/assign-team - Assign (requires admin)
   ```

### 🎯 Performance Optimization

1. **Backend**
   - Database indexes are auto-created
   - Connection pooling configured
   - Error handling optimized

2. **Frontend**
   - Lazy loading for routes
   - Image optimization
   - Caching with local storage

3. **Socket.IO**
   - Configured for production
   - Auto-reconnection enabled
   - Minimal message payload

### 📖 Next Steps

1. **Customize UI**
   - Modify colors in tailwind.config.js
   - Update logos and branding

2. **Add more features**
   - SMS notifications
   - Email alerts
   - Advanced analytics
   - Mobile app version

3. **Database Optimization**
   - Add more indexes as needed
   - Implement pagination
   - Add caching layer (Redis)

4. **Security Hardening**
   - Add rate limiting
   - Implement CAPTCHA
   - Add file scanning for uploads

---

**Need Help?**
- Check terminal logs for errors
- Verify .env files are correctly configured
- Ensure ports 5000 and 5173 are available
- Check MongoDB is running and accessible
