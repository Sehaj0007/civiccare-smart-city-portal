# CivicCare System - Quick Start Guide

## 🚀 GETTING STARTED IN 5 MINUTES

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure Environment

**Backend - `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/civiccare
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Frontend - `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start MongoDB (If Local)

```bash
# macOS via Homebrew
brew services start mongodb-community

# Windows via MongoDB Compass
# Or use MongoDB Atlas (cloud)
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates:
- 1 Supervisor account
- 6 Departments
- 12 Teams
- Test data for login

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 6. Access the System

Open browser to: `http://localhost:5173`

---

## 👥 TEST ACCOUNTS

After seeding, use these accounts:

### Supervisor Account
```
Email: supervisor@civiccare.com
Password: Supervisor@123
Role: SUPERVISOR (Full system access)
```

### Admin Account
```
Email: admin@civiccare.com
Password: Admin@123
Role: ADMIN (Department management)
```

### Team Member Account
```
Email: team1@civiccare.com
Password: Team@123
Role: TEAM_MEMBER (Complaint handling)
```

### Citizen Test Accounts
```
Email: citizen1@civiccare.com
Password: Citizen@123
Email: citizen2@civiccare.com
Password: Citizen@123
```

---

## 🔍 API Endpoints Quick Reference

### Complaint Management
```
POST   /api/complaints/create-with-ai       → Create with AI detection
GET    /api/complaints                       → Get all complaints
GET    /api/complaints/:id                   → Get specific complaint
PUT    /api/complaints/:id/status            → Update status
PUT    /api/complaints/:id/assign-team       → Assign to team
GET    /api/complaints/analytics             → Get analytics data
POST   /api/complaints/export                → Export as CSV/PDF
```

### Team Management
```
POST   /api/teams                            → Create team
GET    /api/teams                            → List teams
GET    /api/teams/:id                        → Get team details
PUT    /api/teams/:id                        → Update team
POST   /api/teams/:id/members                → Add member
DELETE /api/teams/:id/members/:memberId      → Remove member
GET    /api/teams/:id/performance            → Get performance metrics
POST   /api/teams/bulk-assign                → Bulk assign complaints
```

### Supervisor Analytics
```
GET    /api/supervisor/dashboard             → Dashboard data
GET    /api/supervisor/overdue-alerts        → Overdue complaints
GET    /api/supervisor/sla-violations        → SLA violation trends
GET    /api/supervisor/heatmap               → Geographic heatmap
GET    /api/supervisor/activity-timeline     → System activity log
GET    /api/supervisor/department-comparison → Compare departments
POST   /api/supervisor/export-report         → Export full report
```

### Authentication
```
POST   /api/auth/register                    → Register new user
POST   /api/auth/login                       → Login
POST   /api/auth/refresh                     → Refresh token
POST   /api/auth/logout                      → Logout
```

---

## 🎨 Frontend Pages

| Page | Route | Role | Purpose |
|------|-------|------|---------|
| Landing | `/` | Public | Overview & login |
| Login | `/login` | Public | User authentication |
| Register | `/register` | Public | New user signup |
| Raise Complaint | `/raise-complaint` | Citizen | File new complaint |
| My Complaints | `/my-complaints` | Citizen | Track own complaints |
| Complaint Detail | `/complaint/:id` | All Users | View details & updates |
| Admin Dashboard | `/admin` | Admin | Manage departments |
| Supervisor | `/supervisor` | Supervisor | Analytics & alerts |
| Supervisor Dashboard | `/supervisor-enhanced` | Supervisor | Enhanced analytics |
| Privacy Policy | `/privacy` | Public | Legal document |
| Terms | `/terms` | Public | Legal document |

---

## 🛠️ Development Commands

```bash
# Backend
npm start              # Run server
npm run dev           # Run with nodemon
npm run seed          # Seed database
npm test              # Run tests
npm run lint          # Check linting

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Check linting
```

---

## 📊 Key AI Features

### ✨ AI Category Detection
When creating a complaint, the system auto-detects category from description:
- Waste Management
- Potholes
- Electricity
- Water Supply
- Sanitation
- Public Property
- E-Waste
- Security
- Health
- Environment
- Transport
- Education

### 🎯 AI Priority Detection
Auto-assigns priority based on urgency keywords:
- **URGENT**: Emergency, Critical, Danger (6 hour SLA)
- **HIGH**: Severe, Risk, Hazard (12-24 hour SLA)
- **MEDIUM**: Moderate issues (48 hour SLA)
- **LOW**: General issues (72+ hour SLA)

### 🔍 Duplicate Detection
Prevents duplicate complaints by:
- Checking same category
- Geospatial proximity (100m radius)
- Similar status (not already closed)

---

## 📈 Dashboard Metrics

### Supervisor Dashboard Shows:
```
📊 Total Complaints    → All complaints in system
✅ Resolved           → Completed complaints
⏳ Pending            → Awaiting action
🚨 Overdue            → Past SLA deadline

📈 Monthly Trends     → Complaint volume over time
📊 Category Dist.     → Complaints by type
🏢 Department Perf.   → Performance comparison
👥 Team Rankings      → Best performing teams
```

---

## 🔒 Security Features

✅ JWT Token Authentication
✅ Role-Based Access Control (RBAC)
✅ Password Hashing (bcryptjs)
✅ Input Validation
✅ CORS Protection
✅ Helmet.js Security Headers
✅ Rate Limiting
✅ Activity Logging (Audit Trail)

---

## 🐛 Troubleshooting

### Port Already In Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Use MongoDB Atlas if local fails
```

### CORS Errors
```
Solution:
- Check FRONTEND_URL in backend .env
- Verify API_BASE_URL in frontend .env
- Use proper protocol (http:// not https://)
```

### Build Failures
```bash
# Clear dependencies
rm -rf node_modules
npm install

# Clear cache
npm cache clean --force

# Try again
npm run build
```

---

## 📚 API Testing

### Using Postman
1. Import the API collection: [API_COLLECTION.json]
2. Set variables:
   - `base_url`: http://localhost:5000
   - `token`: [JWT token from login]
3. Test endpoints

### Using cURL
```bash
# Create complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "complaintType": "Potholes",
    "description": "Dangerous pothole on Main Street",
    "locality": "Downtown"
  }'

# Get dashboard
curl -X GET http://localhost:5000/api/supervisor/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Mobile Access

The system is fully responsive on mobile:
- Complaint form: Mobile-optimized
- Complaint tracking: Mobile-friendly list
- Supervisor dashboard: Adaptive charts
- Touch-friendly buttons and inputs

---

## 🌐 Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Safari (iOS 13+)
✅ Mobile Chrome (Android 8+)

---

## 📞 Getting Help

### Documentation
- `COMPREHENSIVE_GUIDE.md` - Full architecture guide
- `SYSTEM_CONFIG.md` - Configuration reference
- `IMPLEMENTATION_CHECKLIST.md` - Feature status

### Common Issues
1. **Can't login?** → Check database is connected
2. **API 404 errors?** → Verify route files are imported
3. **No data showing?** → Run seed to generate test data
4. **Real-time updates not working?** → Check Socket.io connection

---

## 🎯 Next Steps

1. ✅ Start the application
2. ✅ Login with test account
3. ✅ Create a test complaint
4. ✅ View complaint in supervisor dashboard
5. ✅ Assign complaint to team
6. ✅ Update complaint status
7. ✅ View analytics

---

## 🚀 Production Deployment

When ready for production:

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Deploy backend (Heroku, AWS, DigitalOcean, etc.)
4. Deploy frontend (Vercel, Netlify, etc.)
5. Configure CORS for production domain
6. Enable HTTPS/SSL
7. Set up monitoring and logging
8. Configure automated backups

---

## 📊 System Performance

Optimized for:
- 1000+ concurrent users
- 100,000+ complaints
- Real-time updates
- Geospatial queries
- Complex analytics

---

## 🎉 You're All Set!

Your complete CivicCare Smart Governance platform is now running.

**Happy Complaining! 🚀**

For more information, see:
- [COMPREHENSIVE_GUIDE.md](COMPREHENSIVE_GUIDE.md)
- [SYSTEM_CONFIG.md](SYSTEM_CONFIG.md)
- [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)

---

**Version**: 2.0
**Last Updated**: February 22, 2024
**Status**: Production Ready ✅

