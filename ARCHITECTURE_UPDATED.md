# System Architecture - Complete Overview

## User Access Paths

```
                           ┌─────────────────────────────────────┐
                           │     CIVICCARE HOME PAGE             │
                           │   (LandingPage.jsx @ /)             │
                           └────────────┬────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┬───────────────────────┐
                │                       │                       │                       │
        ┌───────▼────────┐     ┌───────▼────────┐     ┌───────▼────────┐     ┌───────▼────────┐
        │   Register     │     │  Citizen Login │     │   Admin Login  │     │ Supervisor Login│
        │    Button      │     │    Button      │     │   Button (NEW) │     │   Button (NEW) │
        │   /register    │     │    /login      │     │ /admin-login   │     │/supervisor-login│
        └───────┬────────┘     └───────┬────────┘     └───────┬────────┘     └───────┬────────┘
                │                       │                       │                       │
                │                       │                       │                       │
        ┌───────▼──────────────┐        │              ┌────────▼────────┐   ┌─────────▼──────┐
        │  Registration Form   │        │              │  Admin Login    │   │ Supervisor     │
        │   - Name             │        │              │  - Email        │   │ Login Form     │
        │   - Email            │        │              │  - Password     │   │ - Email        │
        │   - Phone            │        │              │  - Submit       │   │ - Password     │
        │   - Password         │        │              └────────┬────────┘   │ - Submit       │
        │   - Submit           │        │                       │            └─────────┬──────┘
        └───────┬──────────────┘        │                       │                      │
                │                       │                       │                      │
        ┌───────▼──────────────────────▼────────────────────┬───▼───────────────┬─────▼──────────┐
        │  Backend Authentication Layer (Port 5000)         │                   │                │
        ├──────────────────────────────────────────────────┼───────────────────┼────────────────┤
        │                                                  │                   │                │
        │  POST /api/auth/register                        │ POST /api/auth/   │ POST /api/auth/│
        │  - Create User account                          │ login             │ supervisor-login
        │  - Role='USER'                                  │ - Auth User       │ - Auth User +  │
        │  - Verify email/phone                           │ - Return token    │   Supervisor   │
        │  - Hash password                                │ - Return user obj │ - Check linked │
        │  - Return token + user                          │                   │   Supervisor   │
        │                                                  │                   │ - Return both  │
        │  POST /api/auth/admin-login                     │                   │ - Update login │
        │  - Same as login but verify:                    │                   │   timestamp    │
        │  - Role must be ADMIN                           │                   │                │
        │  - Return admin-specific data                   │                   │                │
        └──────────────────────────────────────────────────┴───────────────────┴────────────────┘
                │                       │                       │                      │
                │                       │                       │                      │
        ┌───────▼──────────────────────▼────────────────────┬───▼───────────────┬─────▼──────────┐
        │  Frontend State Management (AuthContext)         │                   │                │
        ├──────────────────────────────────────────────────┼───────────────────┼────────────────┤
        │                                                  │                   │                │
        │  localStorage.setItem('user', {...})           │                   │ localStorage:  │
        │  localStorage.setItem('token', jwt)            │                   │ - user         │
        │  setUser(userObj)                              │                   │ - token        │
        │  setToken(jwtToken)                            │                   │ - supervisor   │
        │                                                 │                   │                │
        └──────────────────────────────────────────────────┴───────────────────┴────────────────┘
                │                       │                       │                      │
                │                       │                       │                      │
        ┌───────▼──────────────┐ ┌──────▼────────────────┐ ┌────▼────────────┐ ┌────▼─────────────┐
        │   USER DASHBOARD     │ │  ADMIN DASHBOARD     │ │ (Optional: Admin)│ │SUPERVISOR        │
        │   (/my-complaints)   │ │  (/admin-dashboard)  │ │ /supervisor      │ │DASHBOARD         │
        │                      │ │                      │ │ (Old endpoint)   │ │(/supervisor-dash)│
        │ Features:            │ │ Features:            │ │                  │ │                  │
        │ - Raise Complaints   │ │ - View All Issues    │ │ (DEPRECATED)     │ │ Features:        │
        │ - View My Issues     │ │ - Assign to Teams    │ │                  │ │ - Profile Info   │
        │ - Track Status       │ │ - Team Management    │ │                  │ │ - Performance    │
        │ - Rate Resolution    │ │ - Analytics          │ │                  │ │ - Metrics        │
        │                      │ │ - SLA Tracking       │ │                  │ │ - Assigned       │
        │                      │ │ - Export Reports     │ │                  │ │   Zones          │
        │                      │ │                      │ │                  │ │ - Permissions    │
        │                      │ │                      │ │                  │ │ - Activity Log   │
        └─┬────────────────────┘ └──────┬─────────────┘ │                  │ └────┬──────────────┘
          │                             │                │                  │      │
          │                             │                └──────────────────┘      │
          │                             │                                         │
          └─────────────────────────────┴─────────────────────────────────────────┘
                                        │
                                        │
                                ┌───────▼──────────────┐
                                │ LOGOUT / Redirect    │
                                │ - Clear localStorage │
                                │ - Clear auth context │
                                │ - Return to Home     │
                                └────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
          ┌─────────▼────────┐  │  ┌─────────▼────────┐
          │  Users Collection│  │  │ Supervisors      │
          │                 │  │  │ Collection (NEW) │
          ├─────────────────┤  │  ├─────────────────┤
          │ _id: ObjectId   │  │  │ _id: ObjectId   │
          │ name: String    │  │  │ userId: Ref(U)  │●─────┐
          │ email: String   │  │  │ name: String    │      │
          │ password: Hash  │  │  │ email: String   │  Link
          │ phone: String   │  │  │ phone: String   │      │
          │ role: 'USER'/'  │  │  │ designation:    │      │
          │        ADMIN'   │  │  │   String        │      │
          │ (NO SUPERVISOR!)│  │  │ department:     │      │
          │ department:Str  │  │  │   String        │      │
          │ isActive:Bool   │  │  │ assignedZones:  │  One-to-One
          │ createdAt: Date │  │  │   [String]      │  Relationship
          │ updatedAt: Date │  │  │ permissions:    │      │
          │                 │  │  │   [String]      │      │
          │                 │  │  │ supervisoryLv:  │      │
          │                 │  │  │   JUNIOR/etc    │      │
          │                 │  │  │ performanceM:   │  ┌───┘
          │                 │  │  │   { total,      │  │
          │                 │  │  │     resolved,   │  │
          │                 │  │  │     slaRate,    │  │
          │                 │  │  │     avgTime,    │  │
          │                 │  │  │     rating }    │  Users
          │                 │  │  │ activityLog:    │  Table
          │                 │  │  │   [{action,     │  │
          │                 │  │  │     timestamp}]│  │
          │                 │  │  │ lastLogin:Date  │  │
          │                 │  │  │ preferences:    │  │
          │                 │  │  │   {notify,      │  │
          │                 │  │  │    layout,      │  │
          │                 │  │  │    theme}       │  │
          │                 │  │  │ isActive: Bool  │  │
          │                 │  │  │ createdAt: Date │  │
          │                 │  │  │ updatedAt: Date │  │
          └─────────────────┘  │  └─────────────────┘  │
                    │          │            ▲          │
                    │          │            │          │
                    │          └────────────┴──────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   Complaints Collection   Other Collections
   (Existing)             (Existing)
```

---

## API Endpoints Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REST API - PORT 5000                             │
└─────────────────────────────────────────────────────────────────────┘

AUTHENTICATION
├── POST /api/auth/register                  [Public]
├── POST /api/auth/login                     [Public] → USER
├── POST /api/auth/admin-login               [Public] → ADMIN
└── POST /api/auth/supervisor-login          [Public] → SUPERVISOR [NEW]

USER COMPLAINTS
├── GET /api/complaints/user/{userId}        [Protected: USER]
├── POST /api/complaints                     [Protected: USER]
├── GET /api/complaints/{id}                 [Protected: USER]
└── PUT /api/complaints/{id}/rating          [Protected: USER]

ADMIN MANAGEMENT
├── GET /api/admin/dashboard                 [Protected: ADMIN]
├── GET /api/admin/complaints                [Protected: ADMIN]
├── PUT /api/complaints/{id}/assign          [Protected: ADMIN]
├── POST /api/admin/teams                    [Protected: ADMIN]
└── GET /api/admin/analytics                 [Protected: ADMIN]

SUPERVISOR MANAGEMENT [NEW]
├── POST /api/supervisors                    [Protected: ADMIN]
├── GET /api/supervisors                     [Protected: ADMIN]
├── GET /api/supervisors/{id}                [Protected]
├── GET /api/supervisors/user/{userId}       [Protected]
├── PUT /api/supervisors/{id}                [Protected: ADMIN]
├── PUT /api/supervisors/{id}/permissions    [Protected: ADMIN]
├── PUT /api/supervisors/{id}/metrics        [Protected: ADMIN]
├── POST /api/supervisors/{id}/activity      [Protected]
├── PUT /api/supervisors/{id}/last-login     [Protected]
└── GET /api/supervisors/{id}/dashboard      [Protected]

OTHER
├── GET /health                              [Public]
└── GET /api/auth/csrf-token                 [Public]
```

---

## Authentication Flow Sequence

```
┌────────────────────────────────────────────────────────────────────┐
│  SUPERVISOR LOGIN FLOW (Complete Flow)                             │
└────────────────────────────────────────────────────────────────────┘

Browser                          Server                        Database
  │                                │                               │
  │─────────── GET /supervisor-login ─────────────►                │
  │◄────────── SupervisorLoginPage (JSX) ────────┤                │
  │                                │                               │
  │  [User enters email & password]│                               │
  │                                │                               │
  │─── POST /api/auth/supervisor-login ──────────►                │
  │     {email, password}           │                               │
  │                                │──► Find User by email ────────►
  │                                │                       ┌────────┤
  │                                │◄─── User object ──────┘        │
  │                                │                               │
  │                                │──► Find Supervisor ───────────►
  │                                │     by userId                 │
  │                                │                       ┌────────┤
  │                                │◄─── Supervisor Obj ───┘        │
  │                                │                               │
  │                                │─► Verify password             │
  │                                │─► Update lastLogin ───────────►
  │                                │                       ┌────────┤
  │                                │◄─── DB Updated ───────┘        │
  │                                │                               │
  │  ◄─── JSON Response ───────────┤                               │
  │  {                              │                               │
  │    token: "jwt_token",          │                               │
  │    user: { _id, name, email },  │                               │
  │    supervisor: { zones, perms } │                               │
  │  }                              │                               │
  │                                │                               │
  │ [Store in localStorage]         │                               │
  │ [Redirect to /supervisor-dash]  │                               │
  │                                │                               │
  │─── GET /supervisor-dashboard ─►                               │
  │                                │                               │
  │◄─ SupervisorDashboard (JSX) ──┤                               │
  │     [Show profile & metrics]    │                               │
  │                                │                               │
```

---

## File Structure

```
civiccare-smart-city-portal/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.jsx              [Existing - User login]
│       │   ├── LandingPage.jsx            [UPDATED - Added Supervisor button]
│       │   ├── SupervisorLoginPage.jsx    [NEW - Supervisor login]
│       │   └── SupervisorDashboard.jsx    [NEW - Supervisor dashboard]
│       │
│       ├── components/
│       │   └── Navbar.jsx                 [UPDATED - Added Supervisor links]
│       │
│       └── App.jsx                        [UPDATED - Added 2 routes]
│
└── backend/
    └── src/
        ├── controllers/
        │   ├── authController.js          [UPDATED - Added supervisorLogin()]
        │   └── supervisorAuthController.js[READY - 11 functions]
        │
        ├── models/
        │   ├── User.js                    [Existing - role: USER/ADMIN]
        │   └── Supervisor.js              [READY - Independent model]
        │
        ├── routes/
        │   ├── authRoutes.js              [UPDATED - /supervisor-login]
        │   └── supervisorRoutes.js        [READY - 11 endpoints]
        │
        └── app.js                         [UPDATED - Mounted /api/supervisors]

Documentation/
├── SUPERVISOR_SETUP.md       [Complete setup guide]
└── SUPERVISOR_COMPLETE.md    [This summary]
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│ React 18+                                                            │
│ React Router (Navigation)                                           │
│ Axios (HTTP client)                                                 │
│ Tailwind CSS (Styling)                                              │
│ React Hot Toast (Notifications)                                     │
│                                                                      │
│ ✅ Supervisor pages built in React                                 │
│ ✅ localStorage for token storage                                  │
│ ✅ AuthContext for state management                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Node.js (Runtime)                                                   │
│ Express.js (Framework)                                              │
│ MongoDB (Database)                                                  │
│ Mongoose (ODM)                                                      │
│ JWT (Authentication)                                                │
│ Bcrypt (Password hashing)                                           │
│                                                                      │
│ ✅ Supervisor model in Mongoose                                    │
│ ✅ Separate API routes structure                                   │
│ ✅ Independent authentication middleware                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary: Three Distinct Systems

```
┌──────────────────────────────────────────────────────────────────────────┐
│            COMPLETE SYSTEM: User + Admin + Supervisor                    │
└──────────────────────────────────────────────────────────────────────────┘

                        ┌─ CITIZEN/USER ─┐
                        │ Role: 'USER'    │
                        │ In: User model  │
                        │ Auth: /login    │
                        │ Page: My issues │
                        └─────────────────┘

                        ┌─ ADMINISTRATOR ─┐
                        │ Role: 'ADMIN'   │
                        │ In: User model  │
                        │ Auth: /admin    │
                        │ Page: Dashboard │
                        └─────────────────┘

                  ┌─ SUPERVISOR (INDEPENDENT) ─┐
                  │ Role: SEPARATE MODEL        │
                  │ In: Supervisor collection   │
                  │ Auth: /supervisor-login     │
                  │ Page: /supervisor-dashboard │
                  └────────────────────────────┘

Each system:
✅ Has own login page
✅ Has own dashboard  
✅ Has own API endpoints
✅ Has own permissions
✅ Has separate authentication
```


