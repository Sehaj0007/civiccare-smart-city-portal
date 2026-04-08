# CivicCare System Architecture Diagrams

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CIVICCARE SMART GOVERNANCE PLATFORM                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │   FRONTEND (React)   │  │  BACKEND (Express)   │  │  DATABASE (MongoDB) │ │
│  ├──────────────────────┤  ├──────────────────────┤  ├─────────────────────┤ │
│  │                      │  │                      │  │                     │ │
│  │ ┌──────────────────┐ │  │ ┌──────────────────┐ │  │ ┌───────────────┐   │ │
│  │ │ Landing Page     │ │  │ │ Auth Controller  │ │  │ │ Users         │   │ │
│  │ ├──────────────────┤ │  │ ├──────────────────┤ │  │ ├───────────────┤   │ │
│  │ │ Login/Register   │ │  │ │ Complaint Ctrl   │ │  │ │ Complaints    │   │ │
│  │ ├──────────────────┤ │  │ ├──────────────────┤ │  │ ├───────────────┤   │ │
│  │ │ Complaint Form   │◄──►│ │ Team Controller  │ │  │ │ Teams         │   │ │
│  │ │ (w/ AI preview)  │ │  │ ├──────────────────┤ │  │ ├───────────────┤   │ │
│  │ ├──────────────────┤ │  │ │ Supervisor Ctrl  │ │  │ │ Departments   │   │ │
│  │ │ My Complaints    │ │  │ ├──────────────────┤ │  │ ├───────────────┤   │ │
│  │ │ (Status Tracking)│ │  │ │ Notification Srv │ │  │ │ Notifications │   │ │
│  │ ├──────────────────┤ │  │ └──────────────────┘ │  │ ├───────────────┤   │ │
│  │ │ Team Dashboard   │ │  │                      │  │ │ ActivityLogs  │   │ │
│  │ │ (Team Members)   │ │  │ ┌──────────────────┐ │  │ └───────────────┘   │ │
│  │ ├──────────────────┤ │  │ │ AI Detection     │ │  │                     │ │
│  │ │ Supervisor Panel │ │  │ │ ├─ Category      │ │  │ Indexes:            │ │
│  │ │ ├─ Overview Tab  │ │  │ │ ├─ Priority      │ │  │ • Complaint status  │ │
│  │ │ ├─ Analytics Tab │ │  │ │ ├─ Duplicate     │ │  │ • Geospatial loc   │ │
│  │ │ ├─ Alerts Tab    │ │  │ │ └─ Tracking ID   │ │  │ • Team load        │ │
│  │ │ └─ Teams Tab     │ │  │ └──────────────────┘ │  │ • User activity    │ │
│  │ ├──────────────────┤ │  │                      │  │                     │ │
│  │ │ Admin Dashboard  │ │  │ ┌──────────────────┐ │  │                     │ │
│  │ └──────────────────┘ │  │ │ Middleware       │ │  │                     │ │
│  │                      │  │ ├─ Auth/JWT       │ │  │                     │ │
│  │ Stack:              │  │ ├─ RBAC          │ │  │                     │ │
│  │ • React 18+         │  │ ├─ Validation    │ │  │                     │ │
│  │ • Vite Build        │  │ └─ Error Handler │ │  │                     │ │
│  │ • Tailwind CSS      │  │                      │  │                     │ │
│  │ • Recharts          │  │ Stack:               │  │ Stack:              │ │
│  │ • Leaflet Maps      │  │ • Express.js         │  │ • MongoDB 5.0+      │ │
│  │ • React Router      │  │ • Mongoose ODM       │  │ • Mongoose ODM      │ │
│  │ • Axios HTTP        │  │ • JWT Auth           │  │ • GeoJSON Support   │ │
│  │ • React Hot Toast   │  │ • Socket.io          │  │ • Full Indexing     │ │
│  │                      │  │ • bcryptjs           │  │                     │ │
│  │ Port: 5173          │  │ • Helmet.js          │  │ Port: 27017         │ │
│  └──────────────────────┘  │ • Rate Limiting      │  │                     │ │
│                            │                      │  └─────────────────────┘ │
│                            │ Port: 5000           │                          │
│                            └──────────────────────┘                          │
│                                        ▲                                      │
│                                        │                                      │
│                            ┌───────────┴────────────┐                        │
│                            ▼                        ▼                        │
│                    ┌──────────────────┐  ┌──────────────────┐              │
│                    │  Socket.io       │  │ JWT Tokens       │              │
│                    │  Real-time       │  │ Authentication   │              │
│                    │  Events          │  │                  │              │
│                    └──────────────────┘  └──────────────────┘              │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW IN CIVICCARE                              │
└─────────────────────────────────────────────────────────────────────────────┘

CITIZEN COMPLAINT CREATION FLOW:
═══════════════════════════════════════════════════════════════════════════════

  Citizen Opens App
        │
        ▼
  [Form Page Loaded]
  ├─ Display 12 Category Buttons
  ├─ Show Map for Location
  └─ Enable Image Upload
        │
        ▼
  Citizen Enters Description
        │
        ▼
  [TEXT CHANGE EVENT] ─────────► [AI Detection Service]
                                  │
                                  ├─► detectCategory(text)
                                  │    └─► Match Against 12 Categories
                                  │
                                  ├─► detectPriority(text)
                                  │    └─► Check Urgency Keywords
                                  │
                                  └─► RETURN: Category + Priority
        │                                    │
        ▼◄───────────────────────────────────┘
  [Show AI Suggestions in UI]
  ├─ "Category: Potholes" [Accept]
  └─ "Priority: HIGH" [Accept]
        │
        ▼
  Citizen Clicks Submit
        │
        ▼
  [Form Validation]
  ├─ Required fields filled?
  ├─ Images selected?
  └─ Location marked?
        │
        ▼
  [POST /api/complaints/create-with-ai]
        │
        ▼
  ┌─ Backend Validation
  ├─ AI Detection (runs again)
  ├─ Duplicate Check
  │  └─► Query geospatial index (100m radius)
  ├─ Generate Tracking ID
  ├─ Calculate SLA Deadline
  └─ Save to Database
        │
        ▼
  ┌─ CREATE Notification
  ├─ EMIT Socket.io Event
  ├─ SAVE ActivityLog
  └─ RETURN: trackingId + SLA Info
        │
        ▼
  [Frontend Shows Confirmation]
  ├─ "Complaint Created!"
  ├─ "Tracking ID: CVC-2024-0001"
  └─ "SLA Deadline: 24 hours"
        │
        ▼
  [Redirect to /my-complaints]


TEAM ASSIGNMENT FLOW:
═══════════════════════════════════════════════════════════════════════════════

  Admin Views Complaint
        │
        ▼
  [Clicks "Assign to Team"]
        │
        ▼
  [GET /api/teams] ─────► Returns all teams with:
                          ├─ currentLoad
                          ├─ maxCapacity
                          ├─ availabilityStatus
                          └─ Performance metrics
        │
        ▼
  [Admin Selects Team]
        │
        ▼
  [PUT /api/complaints/:id/assign-team]
        │
        ▼
  ┌─ Check Team Capacity
  │  └─► if (currentLoad < maxCapacity) continue else error
  │
  ├─ Increment Team.currentLoad
  ├─ Update Team.availabilityStatus
  ├─ Add Timeline Entry
  │
  ├─ SEND Notification to Citizen
  │  └─► "Your complaint assigned to Team A"
  │
  ├─ SEND Notification to Team Members
  │  └─► "New complaint assigned: CVC-2024-0001"
  │
  ├─ EMIT Socket.io Event
  ├─ SAVE ActivityLog
  └─ RETURN: Updated complaint
        │
        ▼
  [Team Notification Received]
  ├─ Real-time alert in app
  ├─ Team can now see complaint
  └─ Status auto-updates


SUPERVISOR DASHBOARD FLOW:
═══════════════════════════════════════════════════════════════════════════════

  Supervisor Opens Dashboard
        │
        ▼
  [Page Mounts] ─► Fetch Data in Parallel:
                  │
                  ├─► [GET /api/supervisor/dashboard]
                  │    └─► Aggregates:
                  │        ├─ Total, Resolved, Pending, Overdue counts
                  │        ├─ Department breakdown with rates
                  │        ├─ Team rankings
                  │        ├─ Category & Priority distribution
                  │        └─ Monthly trends
                  │
                  ├─► [GET /api/supervisor/overdue-alerts]
                  │    └─► Returns overdue complaints (20 max)
                  │
                  └─► [GET /api/supervisor/heatmap]
                      └─► Returns location hotspots
        │
        ▼
  [Process/Transform Data]
  ├─ Calculate percentages
  ├─ Format for charts
  ├─ Sort rankings
  └─ Prepare heatmap coordinates
        │
        ▼
  [Render Dashboard]
  ├─ Tab 1: Overview
  │  ├─ Metric Cards (4 main stats)
  │  ├─ Monthly Trends Chart
  │  ├─ Category Distribution
  │  └─ Department Performance
  │
  ├─ Tab 2: Analytics
  │  ├─ Team Rankings
  │  ├─ Priority Distribution
  │  └─ Performance Metrics
  │
  ├─ Tab 3: Alerts
  │  └─ Overdue Complaints Table
  │    ├─ TrackingID, Category, DaysOverdue
  │    └─ Export Button
  │
  └─ Tab 4: Teams
     └─ Team Performance Cards


SLA TRACKING FLOW:
═══════════════════════════════════════════════════════════════════════════════

  Complaint Created
        │
        ▼
  [Calculate SLA Deadline]
  ├─ Get complaint category
  ├─ Look up SLA hours for that category
  │  Example: POTHOLES = 48 hours
  ├─ Add hours to creation time
  └─ Store in complaint.sla.deadline
        │
        ▼
  [Status Updates to IN_PROGRESS]
        │
        ▼
  [Auto-Calculate Response Time]
  ├─ responseTime = assignedTime - createdTime
  └─ Store in complaint.sla.responseTime
        │
        ▼
  [System Checks Every Hour]
  ├─ If (now > deadline) AND status ≠ RESOLVED
  │  └─► SET complaint.sla.isOverdue = true
  └─ SEND SLA Warning Notification (2 hours before deadline)
        │
        ▼
  [Complaint Resolved]
        │
        ▼
  [Auto-Calculate Resolution Time]
  ├─ resolutionTime = resolvedTime - createdTime
  ├─ If resolutionTime ≤ deadline SLA = ✅ MET
  ├─ If resolutionTime > deadline SLA = ❌ VIOLATED
  └─ Store in complaint.sla.resolutionTime
        │
        ▼
  [Update Analytics]
  ├─ Increment SLA compliance rate
  └─ Update team performance metrics

```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS IN CIVICCARE                          │
└─────────────────────────────────────────────────────────────────────────────┘

REQUEST FLOW WITH SECURITY:
═══════════════════════════════════════════════════════════════════════════════

  Client Request
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ CORS Validation                         │  ✅ Only allowed origins
  │ (CORS Middleware)                       │
  └────────────────────┬────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ Helmet.js Headers                       │  ✅ Security headers
  │ (Helmet Middleware)                     │  • CSP, X-Frame-Options
  └────────────────────┬────────────────────┘  • X-Content-Type-Options
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ Rate Limiting                           │  ✅ Prevent brute force
  │ (Express-Rate-Limit)                    │  • Per IP limits
  └────────────────────┬────────────────────┘  • Per endpoint limits
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ JWT Token Validation                    │  ✅ Verify authenticity
  │ (Auth Middleware)                       │  • Extract Bearer token
  └────────────────────┬────────────────────┘  • Verify signature
        │              • Check expiry
        ▼
  ┌─────────────────────────────────────────┐
  │ Role-Based Access Control               │  ✅ Authorize request
  │ (Authorize Middleware)                  │  • Check user.role
  │ • USER / ADMIN / SUPERVISOR             │  • Verify permissions
  │ • TEAM_MEMBER                           │
  └────────────────────┬────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ Input Validation                        │  ✅ Validate data
  │ (Validation Middleware)                 │  • Field types
  └────────────────────┬────────────────────┘  • Required fields
        │              • Length limits
        ▼              • Email format
  ┌─────────────────────────────────────────┐
  │ Business Logic                          │  ✅ Process request
  │ (Controller)                            │
  │ • Access database                       │
  │ • Make decisions                        │
  └────────────────────┬────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ Activity Logging                        │  ✅ Audit trail
  │ (Save to ActivityLog)                   │  • Action logged
  │ • Who did what                          │  • When (timestamp)
  │ • When and where                        │  • Result
  └────────────────────┬────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────┐
  │ Response Handling                       │  ✅ No data leaks
  │ (Controllers)                           │  • Only needed fields
  │ • Exclude sensitive data                │  • No stack traces
  │ • Show generic errors                   │
  └────────────────────┬────────────────────┘
        │
        ▼
  Response to Client


AUTHENTICATION FLOW:
═══════════════════════════════════════════════════════════════════════════════

  User Email + Password
        │
        ▼
  [POST /api/auth/login]
        │
        ▼
  ├─ Query database for user email
  ├─ User not found? ─► Error 401
  │
  ├─ User found? ─► Compare password with stored hash
  │                  using bcryptjs.compare()
  │
  ├─ Password mismatch? ─► Error 401
  │
  ├─ Password match? ─► Create JWT Token:
  │  ├─ Payload: { userId, role, email }
  │  ├─ Secret: JWT_SECRET from .env
  │  └─ Expiry: 24 hours
  │
  └─ RETURN: { token, user }
        │
        ▼
  Client Stores Token in localStorage
        │
        ▼
  Subsequent API Requests
        │
        ▼
  Authorization: Bearer <TOKEN>
        │
        ▼
  [Auth Middleware]
  ├─ Extract token from header
  ├─ Verify signature with JWT_SECRET
  ├─ Check expiry
  ├─ Invalid/expired? ─► Error 401
  └─ Valid? ─► Extract user data
        │
        ▼
  [Continue to RBAC check]


PASSWORD SECURITY:
═══════════════════════════════════════════════════════════════════════════════

  User Registration: password123
        │
        ▼
  [Admin Registration Endpoint]
  │
  ├─ Generate salt: bcryptjs.genSalt(10)
  │  └─► Creates 10-round computational cost
  │
  ├─ Hash password: bcryptjs.hash(password, salt)
  │  └─► Result: $2b$10$...hashed...
  │
  ├─ Store ONLY the hash in database
  └─ Never store plain text!
        │
        ▼
  User Login
        │
        ▼
  [Login Endpoint]
  │
  ├─ Retrieve hash from database
  ├─ Compare input with hash: bcryptjs.compare()
  │  └─► Returns true/false
  └─ No way to get original password!


```

---

## 🎯 Feature Implementation Matrix

```
┌──────────────────────────────────────────────────────────────────────────┐
│              CIVICCARE FEATURES vs ROLES ACCESSIBILITY MATRIX             │
└──────────────────────────────────────────────────────────────────────────┘

Feature                          │ Citizen │ Admin │ Team │ Supervisor
─────────────────────────────────┼─────────┼───────┼──────┼───────────
File Complaint                   │    ✅    │   ✅   │  ✅   │     ✅
View Own Complaints              │    ✅    │   ✅   │  ✅   │      -
Rate Complaint (Post-Resolution) │    ✅    │   ✅   │   -   │      -
View All Complaints              │    -     │   ✅   │  ✅   │     ✅
Update Complaint Status          │    -     │   ✅   │  ✅   │      -
Assign to Team                   │    -     │   ✅   │   -   │     ✅
View Team Performance            │    -     │   ✅   │  ✅   │     ✅
Manage Teams                      │    -     │   ✅   │   -   │     ✅
Manage Departments               │    -     │   ✅   │   -   │      -
View Analytics Dashboard         │    -     │   ✅   │  ✅   │     ✅
Export Reports                   │    -     │   ✅   │   -   │     ✅
View Overdue Alerts              │    -     │   ✅   │  ✅   │     ✅
View Heatmap                     │    -     │   ✅   │   -   │     ✅
View SLA Violations              │    -     │   ✅   │  ✅   │     ✅
View Activity Log                │    -     │   ✅   │   -   │     ✅
Manage Admins                    │    -     │   -    │   -   │     ✅
View System Statistics           │    -     │   ✅   │   -   │     ✅

✅ = Allowed  │  - = Not Allowed
```

---

## 📤 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE OPTIONS                        │
└──────────────────────────────────────────────────────────────────────────┘

OPTION 1: LOCAL DEVELOPMENT
═════════════════════════════════════════════════════════════════════════════

  Developer Workstation
  ├─ Frontend: localhost:5173 (Vite Dev Server)
  ├─ Backend: localhost:5000 (Node/Express)
  └─ Database: localhost:27017 (MongoDB Local)


OPTION 2: SINGLE SERVER (Production)
═════════════════════════════════════════════════════════════════════════════

  AWS EC2 Instance (t3.medium)
  │
  ├─ Frontend (Nginx)
  │  ├─ Port 80/443
  │  ├─ Serves React build/
  │  └─ SSL Certificate
  │
  ├─ Backend (Node/PM2)
  │  ├─ Port 5000 (internal)
  │  ├─ Process Manager: PM2
  │  └─ Auto-restart on crash
  │
  └─ Database (MongoDB)
     ├─ Local instance OR
     └─ MongoDB Atlas (cloud)


OPTION 3: CONTAINER DEPLOYMENT (Recommended)
═════════════════════════════════════════════════════════════════════════════

  Docker Compose
  │
  ├─ Frontend Container (Node + Vite)
  │  ├─ Image: civiccare-frontend:2.0
  │  ├─ Port: 80/443
  │  └─ Volumes: src code
  │
  ├─ Backend Container (Node + Express)
  │  ├─ Image: civiccare-backend:2.0
  │  ├─ Port: 5000
  │  ├─ Environment: .env mounted
  │  └─ Volumes: logs
  │
  └─ Database Container (MongoDB)
     ├─ Image: mongo:5.0
     ├─ Port: 27017
     ├─ Volumes: /data/db (persistent)
     └─ Environment: auth configured


OPTION 4: KUBERNETES DEPLOYMENT (Enterprise)
═════════════════════════════════════════════════════════════════════════════

  Kubernetes Cluster
  │
  ├─ Frontend Pods (3 replicas)
  │  ├─ Service: civiccare-frontend-svc
  │  └─ Ingress: civiccare.example.com
  │
  ├─ Backend Pods (3 replicas)
  │  ├─ Service: civiccare-backend-svc
  │  ├─ HPA: Auto-scale (2-10 pods)
  │  └─ Environment: ConfigMap + Secrets
  │
  ├─ Database (MongoDB StatefulSet)
  │  ├─ Replicas: 3
  │  ├─ PVC: 100GB persistent volume
  │  └─ Backup: Scheduled snapshots
  │
  └─ Monitoring
     ├─ Prometheus
     ├─ Grafana Dashboards
     └─ AlertManager


OPTION 5: SERVERLESS (AWS Lambda)
═════════════════════════════════════════════════════════════════════════════

  Frontend:
  ├─ S3 Bucket (static website)
  ├─ CloudFront CDN
  └─ IAM policies

  Backend:
  ├─ API Gateway (HTTP endpoints)
  ├─ Lambda Functions (handlers)
  ├─ RDS/DocumentDB (database)
  └─ CloudWatch Logs


```

---

## 🔄 Data Model Relationships

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        DATABASE RELATIONSHIPS                             │
└──────────────────────────────────────────────────────────────────────────┘

                                User (8 roles/types)
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
                   ▼                  ▼                  ▼
              Citizen             Admin (Dept)      Team Member
                   │                  │                  │
                   │                  ▼                  │
                   │            Department (SLA)        │
                   │            ├─ Multiple            │
                   │            ├─ Configuration       │
                   │            └─► Team               │
                   │                   │◄───────────────┘
        ┌──────────┴─────────┐        │
        │                    │        │
        ▼                    ▼        ▼
    Complaint         ActivityLog    Team
    ├─ trackingId      ├─ action      ├─ members
    ├─ category        ├─ userId      ├─ maxCapacity
    ├─ priority        ├─ complaintId ├─ currentLoad
    ├─ status          └─ timestamp   └─ performance
    ├─ sla                            ▲
    ├─ timeline                       │
    ├─ remarks◄─────────┐             │
    ├─ location         │             │
    ├─ images           │             │
    └─► Notification    │             │
            ├─ type      │             │
            ├─ recipient │             │
            └─ read      │             │
                         │             │
                    (Update log)  (Assigned)


REAL-WORLD EXAMPLE:
═════════════════════════════════════════════════════════════════════════════

  Users:
  • john@civiccare.com (CITIZEN) ──────┐
  • admin@civiccare.com (ADMIN) ────┐  │
  • team1@civiccare.com (TEAM) ──┐  │  │
  • supervisor@civiccare.com (SUP)  │  │  │
                                   │  │  │
  Department (Infrastructure):    │  │  │
  • headAdmin: admin@... ◄────────┘  │  │
  • responseTime: 48 hours           │  │
  • teams: [Team A, Team B]           │  │
                                       │  │
  Team A (Pothole Repair):            │  │
  • leader: team1@... ◄───────────────┘  │
  • members: [3 people]                  │
  • currentLoad: 15                       │
  • maxCapacity: 50                       │
                                         │
  Complaint (CVC-2024-0001):            │
  • citizenId: john@... ◄────────────────┘
  • category: POTHOLES
  • description: Large pothole on Main St
  • status: ASSIGNED
  • assignedTeamId: Team A
  • trackingId: CVC-2024-0001
  • sla.deadline: 2024-02-24
  • location: { type: Point, coordinates: [-74.0, 40.7] }
  • images: [url1, url2]
  • remarks: [
      { addedBy: admin, text: "Prioritized", timestamp: ... },
      { addedBy: team1, text: "Starting work", timestamp: ... }
    ]
  • timeline: [
      { status: PENDING, timestamp: 2024-02-22 },
      { status: ASSIGNED, timestamp: 2024-02-22 },
      { status: IN_PROGRESS, timestamp: 2024-02-22 }
    ]

```

---

**END OF ARCHITECTURE DIAGRAMS**

---

Last Updated: February 22, 2024
Version: 2.0
Status: Production Ready ✅

