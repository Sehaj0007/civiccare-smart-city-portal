# CivicCare Complete System Architecture & Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture diagram](#architecture-diagram)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Setup Instructions](#setup-instructions)
7. [Features Overview](#features-overview)
8. [Deployment](#deployment)

---

## 🏢 System Overview

CivicCare is an enterprise-grade Smart Governance Complaint Management System designed to streamline the process of registering, tracking, and resolving civic complaints in urban areas.

### Key Objectives
- Enable citizens to report civic issues seamlessly
- Provide real-time tracking of complaint status
- Manage department-level complaint resolution
- Monitor overall system performance (Supervisor view)
- Implement SLA-driven complaint resolution
- Detect and prevent duplicate complaints
- Provide AI-powered category and priority detection

### System Roles

```
┌─────────────────────────────────────────────┐
│           CIVICCARE SYSTEM ROLES             │
├─────────────────────────────────────────────┤
│ 1. CITIZEN (User)                           │
│    - Register complaints                    │
│    - Track complaint status                 │
│    - Rate and provide feedback              │
│    - Receive real-time notifications        │
│                                             │
│ 2. ADMIN (Department Level)                 │
│    - Manage department complaints           │
│    - Assign to teams                        │
│    - Track team performance                 │
│    - Update complaint status                │
│    - Manage team members                    │
│                                             │
│ 3. SUPERVISOR (Higher Authority)            │
│    - Monitor all departments                │
│    - View analytics & reports               │
│    - Track SLA compliance                   │
│    - Access heatmaps & visualizations      │
│    - Export comprehensive reports           │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **UI Library**: Tailwind CSS
- **Maps**: Leaflet.js
- **Charts**: Recharts
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: Express-validator
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Error Handling**: Custom ErrorHandler

### DevOps & Deployment
- **Version Control**: Git / GitHub
- **Container**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS / GCP / Azure
- **Database Hosting**: MongoDB Atlas

---

## 🏗️ Architecture Design

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React)                    │
├──────────────────────────────────────────────────────────────┤
│  Landing Page │ Login │ Register │ Raise Complaint │ Dashboard
│  Admin Panel │ Supervisor Dashboard │ Team Management │ Analytics
└──────────────────────────────────────────────────────────────┘
                              ↕
                    (REST API + Socket.io)
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API LAYER                      │
├──────────────────────────────────────────────────────────────┤
│  Authentication     │  Complaint Management  │  Team Management
│  Controllers        │  AI Detection          │  Supervisor Analytics
│  Middleware         │  SLA Tracking          │  Notification Service
│  Route Handlers     │  Activity Logging      │  Report Generation
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                     DATA LAYER (MongoDB)                     │
├──────────────────────────────────────────────────────────────┤
│  User Collection  │ Complaint Collection  │ Team Collection
│  Department       │ Notification          │ ActivityLog
│  Team Members     │ SLA Tracking          │ Performance Metrics
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├──────────────────────────────────────────────────────────────┤
│  Google Maps API │ AWS S3 │ Email Service │ Geolocation API
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### Collections Structure

#### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: Enum ['USER', 'ADMIN', 'SUPERVISOR', 'TEAM_MEMBER'],
  department: String, // For ADMIN & TEAM_MEMBER
  isVerified: Boolean,
  profilePhoto: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Complaints Collection**
```javascript
{
  _id: ObjectId,
  trackingId: String (unique, indexed),
  category: String (enumerated),
  title: String,
  description: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON
  },
  locality: String,
  address: String,
  city: String,
  images: [{url, uploadedAt}],
  priority: Enum ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  status: Enum ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  isDuplicate: Boolean,
  duplicateOf: ObjectId, // Ref to original complaint
  citizenId: ObjectId, // Ref to User
  assignedTeamId: ObjectId, // Ref to Team
  assignedByAdminId: ObjectId, // Ref to User
  sla: {
    deadline: Date,
    isOverdue: Boolean,
    responseDeadline: Date,
    resolutionDeadline: Date
  },
  remarks: [{
    addedBy: ObjectId,
    text: String,
    timestamp: Date
  }],
  timeline: [{
    status: String,
    timestamp: Date,
    ChangedBy: ObjectId
  }],
  rating: {
    score: Number (1-5),
    feedback: String,
    ratedAt: Date
  },
  responseTime: Number, // in hours
  resolutionTime: Number, // in hours
  createdAt: Date,
  resolvedAt: Date,
  updatedAt: Date
}
```

#### 3. **Teams Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  department: ObjectId, // Ref to Department
  description: String,
  members: [ObjectId], // Refs to User
  maxCapacity: Number,
  currentLoad: Number,
  availabilityStatus: Enum ['AVAILABLE', 'BUSY', 'OFFLINE'],
  assignedComplaints: [ObjectId],
  performanceMetrics: {
    totalAssigned: Number,
    totalResolved: Number,
    averageResolutionTime: Number,
    slaComplianceRate: Number (0-100),
    overallRating: Number (0-5)
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Departments Collection**
```javascript
{
  _id: ObjectId,
  name: String (unique),
  displayName: String,
  description: String,
  sla: {
    responseTime: Number,
    resolutionTime: Number,
    priority: String
  },
  headAdmin: ObjectId, // Ref to User
  teams: [ObjectId],
  stats: {
    totalComplaints: Number,
    resolvedComplaints: Number,
    pendingComplaints: Number,
    overdueComplaints: Number,
    averageResolutionTime: Number,
    performanceRating: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **Notifications Collection**
```javascript
{
  _id: ObjectId,
  recipient: ObjectId, // Ref to User
  type: Enum ['COMPLAINT_REGISTERED', 'ASSIGNED', 'STATUS_UPDATED', 'RESOLVED', 'SLA_WARNING', 'OVERDUE_ALERT'],
  title: String,
  message: String,
  priority: Enum ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  read: Boolean,
  readAt: Date,
  relatedComplaint: ObjectId,
  relatedTeam: ObjectId,
  actionUrl: String,
  metadata: Mixed,
  createdAt: Date
}
```

#### 6. **ActivityLog Collection**
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Ref to User
  complaint: ObjectId, // Ref to Complaint
  action: Enum ['CREATED', 'VIEWED', 'ASSIGNED', 'STATUS_CHANGED', 'RESOLVED'],
  description: String,
  oldValue: Mixed,
  newValue: Mixed,
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

### Database Indexes
```javascript
// Complaints
db.complaints.createIndex({ trackingId: 1 });
db.complaints.createIndex({ citizenId: 1, createdAt: -1 });
db.complaints.createIndex({ category: 1, status: 1 });
db.complaints.createIndex({ location: "2dsphere" }); // Geospatial

// Teams
db.teams.createIndex({ department: 1 });
db.teams.createIndex({ availabilityStatus: 1 });

// Departments
db.departments.createIndex({ name: 1 });

// Notifications
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, read: 1 });

// ActivityLog
db.activitylogs.createIndex({ complaint: 1, timestamp: -1 });
db.activitylogs.createIndex({ user: 1, timestamp: -1 });
```

---

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/auth/register      - Register new user
POST /api/auth/login         - Login user
POST /api/auth/logout        - Logout
POST /api/auth/refresh-token - Refresh JWT token
```

### Complaint Endpoints
```
POST   /api/complaints/create              - Create complaint (enhanced with AI)
GET    /api/complaints                     - Get all complaints (with filters)
GET    /api/complaints/:id                 - Get complaint details
PATCH  /api/complaints/:id/status          - Update status (with SLA tracking)
PATCH  /api/complaints/:id/assign-team     - Assign to team
GET    /api/complaints/analytics/summary   - Get analytics
GET    /api/complaints/export/pdf          - Export as CSV/PDF
```

### Team Endpoints
```
POST   /api/teams                          - Create team
GET    /api/teams                          - Get all teams
GET    /api/teams/:id                      - Get team details
PATCH  /api/teams/:id                      - Update team
POST   /api/teams/:id/members              - Add member
DELETE /api/teams/:id/members/:userId      - Remove member
GET    /api/teams/:id/performance          - Performance metrics
POST   /api/teams/:id/bulk-assign          - Bulk assign complaints
```

### Supervisor Endpoints
```
GET    /api/supervisor/dashboard           - Dashboard overview
GET    /api/supervisor/alerts/overdue      - Overdue alerts
GET    /api/supervisor/analytics/sla-violations - SLA trends
GET    /api/supervisor/analytics/heatmap   - Area heatmap
GET    /api/supervisor/activity/timeline   - Activity logs
GET    /api/supervisor/analytics/department-comparison - Comparison
GET    /api/supervisor/reports/export      - Export reports
```

### Notification Endpoints
```
GET    /api/notifications                  - Get user notifications
PATCH  /api/notifications/:id/read         - Mark as read
PATCH  /api/notifications/mark-all-read    - Mark all as read
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/civiccare-smart-city-portal.git
cd civiccare-smart-city-portal/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/civiccare
JWT_SECRET=your_secret_key_here_make_it_long
JWT_EXPIRE=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
LOG_LEVEL=debug
EOF

# Run database migrations/seed
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_AI_DETECTION=true
EOF

# Start development server
npm run dev

# Build for production
npm run build
```

---

## ✨ Features Overview

### 1. **AI-Powered Category Detection**
- Analyzes complaint description
- Auto-detects complaint category
- Machine learning-based pattern matching
- Keyword-based fallback system

### 2. **Smart Priority Assignment**
- AI analyzes urgency level
- Category-based default priorities
- Keyword detection (emergency, critical, etc.)
- Manual override option

### 3. **Duplicate Complaint Detection**
- Geospatial proximity checking
- Temporal similarity analysis
- Category matching
- Prevents duplicate work

### 4. **SLA Management**
- Category-specific SLA times
- Real-time deadline tracking
- Automated overdue alerts
- SLA compliance reporting

### 5. **Team Management**
- Team capacity tracking
- Availability management
- Performance metrics
- Work distribution

### 6. **Real-time Notifications**
- Socket.io live updates
- Multiple notification types
- Priority-based alerting
- Read status tracking

### 7. **Analytics & Reporting**
- Department performance comparison
- Team rankings
- Category distribution analysis
- Monthly trend charts
- SLA compliance rate
- Export to CSV/PDF

### 8. **Geospatial Features**
- Complaint location mapping
- Heatmap visualization
- Area-based analysis
- GeoJSON support

---

## 📊 Dashboard Views

### Citizen Dashboard
- Complaint history
- Tracking information
- Real-time status updates
- Complaint details
- Rating & feedback

### Admin Dashboard
- Department complaints
- Team management
- Status assignment
- Performance metrics
- Category overview

### Supervisor Dashboard
- System-wide overview
- Department comparison
- Team rankings
- SLA monitoring
- Overdue alerts
- Activity timeline
- Advanced analytics

---

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation & sanitization
- CORS protection
- Rate limiting
- SQL injection prevention (MongoDB)
- HTTPS support

---

## 📈 Performance Optimization

- Database indexing
- Query optimization
- Connection pooling
- Caching strategies
- Lazy loading
- Code splitting
- Image optimization
- Pagination

---

## 🚢 Deployment

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Cloud Deployment (AWS Example)
```bash
# Frontend: AWS S3 + CloudFront
npm run build
aws s3 sync dist/ s3://civiccare-bucket/

# Backend: AWS EC2
git clone repo
cd backend
npm install
pm2 start app.js --name civiccare-api
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civiccare
JWT_SECRET=<strong-random-secret>
ALLOWED_ORIGINS=https://civiccare.com
LOG_LEVEL=error
```

---

## 📝 Development Guide

### Adding a New Feature

1. **Create database model** (If needed)
   - Add schema in `backend/src/models/`
   - Create indexes

2. **Create controller**
   - Add business logic in `backend/src/controllers/`
   - Handle errors appropriately

3. **Create routes**
   - Define endpoints in `backend/src/routes/`
   - Add middleware & validation

4. **Frontend component**
   - Create React component in `frontend/src/pages/` or `frontend/src/components/`
   - Use context API for state
   - Integrate API service

5. **Write tests**
   - Backend: `backend/src/__tests__/`
   - Frontend: `frontend/src/__tests__/`

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running
- Verify connection string
- Check network connectivity
- Whitelist IP (for Atlas)

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000
kill -9 <PID>
```

###  CORS Errors
- Check ALLOWED_ORIGINS in .env
- Verify API URL in frontend .env

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Guide](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support & Contribution

For issues, suggestions, or contributions, please:
1. Check existing issues
2. Create detailed bug reports
3. Follow code conventions
4. Submit pull requests

---

**Last Updated**: February 2024
**Version**: 2.0 (Enhanced)
**Maintainer**: CivicCare Dev Team

