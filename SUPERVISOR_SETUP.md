# Supervisor Module - Complete Separation Guide

## Overview
Supervisor is now a completely independent module, separate from User and Admin roles. It has its own:
- Login page & authentication endpoint
- Dashboard
- Data model
- Controller and routes
- Permissions system

---

## Frontend Architecture

### Login Flow
**Home Page (LandingPage.jsx)** → 4 Login Options:
1. **Citizen Login** → `/login` → User Dashboard
2. **Admin Login** → `/admin-login` → Admin Dashboard  
3. **Supervisor Login** → `/supervisor-login` → Supervisor Dashboard [NEW]
4. **Register** → `/register` → User Registration

### Pages Created

#### 1. SupervisorLoginPage.jsx
- **Path**: `/supervisor-login`
- **Features**:
  - Email & password authentication
  - Calls POST `/api/auth/supervisor-login`
  - Stores supervisor profile in localStorage
  - Redirects to `/supervisor-dashboard` on success
  - Shows supervisor-specific UI (👮 icon)

#### 2. SupervisorDashboard.jsx
- **Path**: `/supervisor-dashboard`
- **Features**:
  - Displays supervisor profile info
  - Performance metrics (total complaints, resolved, SLA compliance, team rating)
  - Assigned zones display
  - Permissions list
  - Separate logout button
  - Protected by localStorage token

### Navbar Updates
Added "Supervisor Login" button to:
- Desktop navigation menu (when not authenticated)
- Mobile menu (when not authenticated)
- Styled with purple color (distinct from green/white)

---

## Backend Architecture

### Authentication Endpoint
**POST `/api/auth/supervisor-login`**

**Request**:
```json
{
  "email": "supervisor@civiccare.com",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "id": "user_id",
    "name": "John Supervisor",
    "email": "supervisor@civiccare.com",
    "phone": "1234567890",
    "role": "SUPERVISOR"
  },
  "supervisor": {
    "_id": "supervisor_id",
    "designation": "Senior Supervisor",
    "department": "WASTE_MANAGEMENT",
    "supervisoryLevel": "SENIOR",
    "assignedZones": ["ZONE_A", "ZONE_B"],
    "permissions": ["VIEW_DASHBOARD", "MANAGE_COMPLAINTS", ...],
    "performanceMetrics": {
      "totalComplaints": 150,
      "resolvedComplaints": 140,
      "slaComplianceRate": 92,
      "averageResolutionTime": 48,
      "teamRating": 4.5
    },
    "lastLogin": "2026-02-22T13:45:00Z"
  }
}
```

### API Routes (New)
**Base URL**: `/api/supervisors`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/` | ADMIN | Create new supervisor |
| GET | `/` | ADMIN | List all supervisors (with filters) |
| GET | `/:id` | ANY | Get supervisor by ID |
| GET | `/user/:userId` | ANY | Get supervisor by linked user |
| PUT | `/:id` | ADMIN | Update supervisor details |
| DELETE | `/:id` | ADMIN | Delete supervisor |
| PUT | `/:id/permissions` | ADMIN | Update permissions |
| PUT | `/:id/metrics` | ADMIN | Update performance metrics |
| POST | `/:id/activity` | ANY | Add activity log entry |
| PUT | `/:id/last-login` | ANY | Update last login timestamp |
| GET | `/:id/dashboard` | ANY | Get supervisor dashboard data |

### Supervisor Model (Supervisor.js)
```javascript
{
  userId: ObjectId,            // Reference to User (unique)
  name: String,                // Duplicated from User for speed
  email: String,               // Duplicated from User for speed
  phone: String,               // Duplicated from User for speed
  designation: String,         // e.g., "Senior Supervisor"
  department: String,          // e.g., "WASTE_MANAGEMENT"
  assignedZones: [String],     // e.g., ["ZONE_A", "ZONE_B"]
  supervisoryLevel: String,    // JUNIOR, SENIOR, LEAD, CHIEF
  permissions: [String],       // 10 specific permissions
  performanceMetrics: {
    totalComplaints: Number,
    resolvedComplaints: Number,
    slaComplianceRate: Number,
    averageResolutionTime: Number,
    teamRating: Number,
    lastUpdated: Date
  },
  activityLog: [{
    action: String,
    timestamp: Date,
    details: String
  }],
  lastLogin: Date,
  preferences: {
    emailNotifications: Boolean,
    dashboardLayout: String,
    theme: String
  },
  isActive: Boolean
}
```

### Supervisor Permissions (10 types)
1. `VIEW_DASHBOARD` - Access supervisor dashboard
2. `VIEW_ANALYTICS` - View analytics and reports
3. `MANAGE_COMPLAINTS` - Handle complaints
4. `MANAGE_TEAMS` - Manage assigned teams
5. `MANAGE_USERS` - Manage users in zones
6. `GENERATE_REPORTS` - Create reports
7. `VIEW_ACTIVITY_LOG` - View activity logs
8. `SEND_NOTIFICATIONS` - Send notifications
9. `MANAGE_SLA` - Manage SLA settings
10. `DELETE_COMPLAINTS` - Delete complaints (high privilege)

---

## Data Storage

### Frontend (localStorage)
```javascript
// When supervisor logs in:
localStorage.setItem('user', JSON.stringify(user));          // User object
localStorage.setItem('token', token);                         // JWT token
localStorage.setItem('supervisor', JSON.stringify(supervisor)); // Supervisor profile
```

### Backend (MongoDB)
- **Users Collection**: User account with role='USER' or 'ADMIN' (NO SUPERVISOR)
- **Supervisors Collection**: Independent supervisor profiles linked via userId

---

## User Types (Final Architecture)

### 1. Citizen (USER)
- **Registration**: Self-register via `/register`
- **Login**: `/login`
- **Dashboard**: `/my-complaints`
- **Features**: Raise complaints, track status, view details
- **Role in DB**: `role: 'USER'` in User model

### 2. Administrator (ADMIN)
- **Login**: `/admin-login`
- **Dashboard**: `/admin-dashboard`
- **Features**: Manage complaints, assign teams, view statistics
- **Role in DB**: `role: 'ADMIN'` in User model

### 3. Supervisor (SUPERVISOR) - [NEW]
- **Login**: `/supervisor-login` (independent)
- **Dashboard**: `/supervisor-dashboard` (independent)
- **Features**: Oversee complaints, manage teams, view metrics
- **Storage**: Separate Supervisor model (not in User role enum)
- **Access**: Read-only access to complaints in assigned zones

---

## Migration Path (Optional)

If you have existing supervisors from the old system:

1. **Query old supervisors** from User model with `role: 'SUPERVISOR'`
2. **Create Supervisor profiles** for each using supervisorAuthController.createSupervisor()
3. **Remove SUPERVISOR role** from User model (already done)
4. **Update users** to role='USER' who were supervisors

---

## Security Considerations

✅ **Protected Routes**:
- Supervisor login requires valid user + supervisor profile
- Supervisor dashboard checks localStorage token
- API endpoints verify authentication middleware

✅ **Permissions**:
- Each supervisor has specific permissions granted by admin
- Activity log tracks all supervisor actions
- Last login timestamps for audit

✅ **Data Isolation**:
- Supervisors only see complaints in assigned zones
- Activity log separate from complaint history
- Performance metrics tracked independently

---

## Testing Supervisor Features

### 1. Login as Supervisor
```
URL: http://localhost:5173/supervisor-login
Email: supervisor@civiccare.com
Password: password123
Expected: Redirect to /supervisor-dashboard
```

### 2. Create Supervisor (as Admin)
```javascript
POST http://localhost:5000/api/supervisors
Headers: Authorization: Bearer {admin_token}
Body: {
  "userId": "user_id_here",
  "designation": "Senior Supervisor",
  "department": "WASTE_MANAGEMENT",
  "assignedZones": ["ZONE_A", "ZONE_B"],
  "supervisoryLevel": "SENIOR"
}
```

### 3. View Supervisor Dashboard
```
URL: http://localhost:5173/supervisor-dashboard
Expected: Show profile, metrics, zones, permissions
```

---

## Files Modified/Created

### Frontend (New/Modified)
- ✅ `SupervisorLoginPage.jsx` - New login page
- ✅ `SupervisorDashboard.jsx` - New dashboard
- ✅ `App.jsx` - Added routes and imports
- ✅ `LandingPage.jsx` - Added Supervisor Login button
- ✅ `Navbar.jsx` - Added Supervisor login link

### Backend (New/Modified)
- ✅ `supervisorAuthController.js` - 11 controller functions
- ✅ `Supervisor.js` - MongoDB model
- ✅ `supervisorRoutes.js` - API routes
- ✅ `authController.js` - Added supervisorLogin endpoint
- ✅ `authRoutes.js` - Added /supervisor-login route
- ✅ `app.js` - Mounted supervisor routes

---

## Next Steps (Optional Features)

1. **Supervisor Onboarding**: Create endpoint to assign new supervisors
2. **Complaint Management**: Add supervisor-specific complaint viewing
3. **Team Analytics**: Dashboard showing team performance
4. **Notifications**: Real-time alerts for zone complaints
5. **Reports**: Generate zone/team reports
6. **Activity Timeline**: Visualize supervisor actions
7. **Mobile App**: Native app for supervisor access

---

## Troubleshooting

### Issue: Login fails with "You are not registered as a supervisor"
**Solution**: Create supervisor profile via admin endpoint first

### Issue: Supervisor dashboard shows empty metrics
**Solution**: Update metrics via PUT `/api/supervisors/:id/metrics`

### Issue: Cannot login after registration
**Solution**: Verify user exists, then create supervisor profile

### Issue: Zones not showing on dashboard
**Solution**: Check assignedZones array in supervisor document

---

**Created**: February 22, 2026
**Version**: 1.0
**Status**: Complete Separation Achieved ✅
