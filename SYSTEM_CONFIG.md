# CivicCare Enhanced Backend Configuration

## Environment Variables (backend/.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
HOST=localhost

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/civiccare
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civiccare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_make_it_long_and_random
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000,http://localhost:8080

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50mb
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@civiccare.com
SENDER_NAME=CivicCare

# AWS S3 (Optional, for image storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=civiccare-bucket
AWS_REGION=ap-south-1

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# AI/ML Service (Optional)
GOOGLE_CLOUD_API_KEY=your_google_cloud_key
```

## Frontend Configuration (frontend/.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_ENV=development

# Feature Flags
VITE_ENABLE_AI_DETECTION=true
VITE_ENABLE_MAP=true
VITE_MAP_API_KEY=your_google_maps_api_key

# Pagination
VITE_ITEMS_PER_PAGE=10

# Upload Settings
VITE_MAX_FILE_SIZE=50
VITE_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf
```

## Key Features Configuration

### SLA Configuration (backend/src/utils/aiDetection.js)

```javascript
const slaHours = {
  ELECTRICITY: 24,      // Critical - 24 hours
  WATER: 48,           // High - 48 hours
  SECURITY: 6,         // Urgent - 6 hours
  HEALTH: 12,          // High - 12 hours
  SANITATION: 48,      // Medium - 48 hours
  WASTE_MANAGEMENT: 48, // Medium - 48 hours
  POTHOLES: 72,        // Low - 72 hours
  PUBLIC_PROPERTY: 72,  // Low - 72 hours
  E_WASTE: 72,         // Low - 72 hours
  ENVIRONMENT: 96,      // Low - 96 hours
  TRANSPORT: 72,       // Medium - 72 hours
  EDUCATION: 72,       // Low - 72 hours
};
```

### Priority Detection Keywords

- **URGENT**: urgent, emergency, critical, danger, grave, serious, life threatening, major accident
- **HIGH**: severe, dangerous, risk, hazard, significant, flooding, fire
- **MEDIUM**: immediate, issue, problem
- **LOW**: minor, small

### Category Detection Keywords

```javascript
WASTE_MANAGEMENT: ['waste', 'garbage', 'trash', 'dump', 'recycle']
POTHOLES: ['pothole', 'road', 'pavement', 'asphalt', 'crack']
ELECTRICITY: ['electricity', 'power', 'light', 'voltage', 'blackout']
WATER: ['water', 'pipeline', 'supply', 'leak', 'contamination']
SANITATION: ['sanitation', 'sewage', 'drain', 'sewer', 'hygiene']
PUBLIC_PROPERTY: ['property', 'bench', 'wall', 'vandalism', 'damage']
E_WASTE: ['e-waste', 'electronic', 'computer', 'mobile', 'battery']
SECURITY: ['security', 'crime', 'theft', 'vandalism', 'police']
HEALTH: ['health', 'hygiene', 'medical', 'hospital', 'disease']
ENVIRONMENT: ['environment', 'pollution', 'tree', 'air', 'noise']
TRANSPORT: ['traffic', 'parking', 'transport', 'vehicle', 'bus']
EDUCATION: ['school', 'college', 'education', 'student', 'university']
```

## Database Schema Overview

### Complaint Schema
- trackingId (unique)
- category
- title, description
- location (GeoJSON Point)
- images (array)
- priority (LOW, MEDIUM, HIGH, URGENT)
- status (PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)
- SLA tracking (deadline, isOverdue)
- timeline (history of status changes)
- remarks (array of comments)
- assignment tracking

### Team Schema
- name, department
- members (array of user IDs)
- maxCapacity, currentLoad
- availabilityStatus
- performanceMetrics
- assignedComplaints

### Department Schema
- name, displayName
- SLA configuration
- teams (array)
- performance stats

### Notification Schema
- recipient, type, title, message
- priority, read status
- related complaint/team
- metadata

### ActivityLog Schema
- user, complaint, action
- timestamp, description
- old/new values for tracking changes

## API Endpoints Summary

### Complaint APIs
- `POST /api/complaints/create` - Create complaint with AI detection
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get complaint details
- `PATCH /api/complaints/:id/status` - Update status with SLA tracking
- `PATCH /api/complaints/:id/assign-team` - Assign to team
- `GET /api/complaints/analytics/summary` - Get analytics
- `GET /api/complaints/export/pdf` - Export report

### Team APIs
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details
- `PATCH /api/teams/:id` - Update team
- `POST /api/teams/:id/members` - Add member
- `DELETE /api/teams/:id/members/:userId` - Remove member
- `GET /api/teams/:id/performance` - Get performance metrics
- `POST /api/teams/:id/bulk-assign` - Bulk assign complaints

### Supervisor APIs
- `GET /api/supervisor/dashboard` - Get comprehensive dashboard
- `GET /api/supervisor/alerts/overdue` - Get overdue alerts
- `GET /api/supervisor/analytics/sla-violations` - SLA trends
- `GET /api/supervisor/analytics/heatmap` - Area heatmap
- `GET /api/supervisor/activity/timeline` - Activity logs
- `GET /api/supervisor/analytics/department-comparison` - Department comparison
- `GET /api/supervisor/reports/export` - Export reports

## Authentication & Authorization

### Role-Based Access Control (RBAC)

```
USER (Citizen):
- Register complaints
- View own complaints
- Track complaint status
- Rate and provide feedback

ADMIN (Department Level):
- View department complaints
- Assign to teams
- Update complaint status
- Manage teams
- View department analytics

SUPERVISOR (Higher Authority):
- View all complaints across all departments
- Monitor team performance
- View SLA violations
- Generate reports
- Monitor overdue complaints
- Access heatmaps and analytics
```

## Real-Time Features (Socket.io)

```javascript
// Events
notification:new - New notification
complaint:created - New complaint registered
complaint:assigned - Complaint assigned to team
complaint:status-changed - Status updated
complaint:sla-warning - SLA warning
team:availability-changed - Team availability updated
alert:overdue - Overdue alert
```

## Performance Metrics Tracked

1. **Response Time** - Time from complaint creation to assignment
2. **Resolution Time** - Time from creation to resolution
3. **SLA Compliance Rate** - % of complaints resolved within SLA
4. **Resolution Rate** - % of total complaints resolved
5. **Overdue Count** - Number of SLA-violated complaints
6. **Team Performance Rating** - Overall team rating (0-5)
7. **Capacity Utilization** - % of team capacity used
8. **Duplicate Detection** - Detection and flagging of duplicate complaints

## Monitoring & Alerts

- SLA Warning: 2 hours before deadline
- Overdue Alert: When deadline is exceeded
- Team Capacity Alert: When team reaches 80% capacity
- Performance Alert: When SLA compliance drops below 80%

