# CivicCare API Reference Guide

## 📋 Authentication

All endpoints (except `/api/auth/*` and public pages) require:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Login
```
POST /api/auth/login
Body: {
  "email": "user@civiccare.com",
  "password": "password123"
}
Response: {
  "token": "eyJhbGc...",
  "user": { "id", "name", "email", "role" }
}
```

### Register
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@civiccare.com",
  "password": "password123",
  "role": "USER"
}
Response: { "message": "User created", "userId": "..." }
```

---

## 🎫 Complaint Endpoints

### Create Complaint (with AI)
```
POST /api/complaints/create-with-ai
Headers: Authorization: Bearer TOKEN
Body: {
  "complaintType": "Potholes",
  "description": "Large pothole at Main Street intersection",
  "address": "123 Main Street",
  "locality": "Downtown",
  "city": "Springfield",
  "images": ["base64_image_data"],
  "latitude": 40.7128,
  "longitude": -74.0060
}
Response: {
  "success": true,
  "complaint": {
    "id": "complaint_id",
    "trackingId": "CVC-2024-0001",
    "category": "POTHOLES",
    "priority": "HIGH",
    "status": "PENDING",
    "sla": {
      "deadline": "2024-02-24T...",
      "responseDeadline": "2024-02-23T...",
      "resolutionDeadline": "2024-02-24T..."
    },
    "isDuplicate": false,
    "duplicateSuggestions": []
  }
}
```

### Get All Complaints
```
GET /api/complaints?status=PENDING&category=POTHOLES&locality=Downtown
Query Parameters:
  - status: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
  - category: WASTE_MANAGEMENT, POTHOLES, ELECTRICITY, etc.
  - priority: LOW, MEDIUM, HIGH, URGENT
  - locality: string (city ward)
  - isOverdue: true/false
  - page: 1, 2, 3, ...
  - limit: 10, 20, 50, ...

Response: {
  "complaints": [
    {
      "id": "...",
      "trackingId": "CVC-2024-0001",
      "complaintType": "Potholes",
      "description": "...",
      "status": "PENDING",
      "priority": "HIGH",
      "category": "POTHOLES",
      "locality": "Downtown",
      "sla": { "deadline": "...", "isOverdue": false },
      "createdAt": "2024-02-22T...",
      "responseTime": 0,
      "resolutionTime": 0,
      "citizenId": { "name": "John Doe", "phone": "..." },
      "assignedTeamId": { "name": "Team A", "department": "..." }
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 5
}
```

### Get Single Complaint
```
GET /api/complaints/:id
Response: {
  "id": "...",
  "trackingId": "CVC-2024-0001",
  "complaintType": "Potholes",
  "description": "...",
  "status": "ASSIGNED",
  "priority": "HIGH",
  "category": "POTHOLES",
  "locality": "Downtown",
  "city": "Springfield",
  "images": ["url1", "url2"],
  "location": {
    "type": "Point",
    "coordinates": [-74.0060, 40.7128]
  },
  "sla": {
    "deadline": "2024-02-24T10:00:00Z",
    "responseDeadline": "2024-02-23T10:00:00Z",
    "resolutionDeadline": "2024-02-24T10:00:00Z",
    "isOverdue": false,
    "responseTime": 120,
    "resolutionTime": null
  },
  "timeline": [
    {
      "status": "PENDING",
      "timestamp": "2024-02-22T10:00:00Z",
      "changedBy": "SYSTEM",
      "reason": "Auto-created"
    },
    {
      "status": "ASSIGNED",
      "timestamp": "2024-02-22T11:30:00Z",
      "changedBy": "admin@civiccare.com",
      "reason": "Assigned to Team A"
    }
  ],
  "remarks": [
    {
      "addedBy": { "name": "Team Member", "email": "..." },
      "text": "Starting work on this today",
      "timestamp": "2024-02-22T14:00:00Z"
    }
  ],
  "citizenId": {
    "name": "John Doe",
    "email": "john@civiccare.com",
    "phone": "555-1234"
  },
  "assignedTeamId": {
    "name": "Pothole Team",
    "department": "Infrastructure",
    "members": [
      { "name": "Mike", "phone": "..." },
      { "name": "Jane", "phone": "..." }
    ]
  },
  "rating": {
    "score": null,
    "feedback": null,
    "ratedAt": null
  }
}
```

### Update Complaint Status
```
PUT /api/complaints/:id/status
Headers: Authorization: Bearer TOKEN
Body: {
  "status": "IN_PROGRESS",
  "remarks": "Starting work immediately"
}
Response: {
  "success": true,
  "complaint": { ...updated complaint... },
  "notification": { "sent": true, "to": "citizen@..." }
}
```

### Assign Complaint to Team
```
PUT /api/complaints/:id/assign-team
Headers: Authorization: Bearer TOKEN
Body: {
  "teamId": "team_id_here"
}
Response: {
  "success": true,
  "complaint": { ...updated complaint... },
  "notification": {
    "sentToCitizen": true,
    "sentToTeam": true,
    "teamMembersCount": 3
  }
}
```

### Get Complaint Analytics
```
GET /api/complaints/analytics?status=RESOLVED&month=2024-02
Query Parameters:
  - status: PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, etc.
  - category: specific category or all
  - month: YYYY-MM format
  - locality: specific locality or all

Response: {
  "total": 150,
  "byStatus": {
    "PENDING": 30,
    "ASSIGNED": 45,
    "IN_PROGRESS": 40,
    "RESOLVED": 35,
    "CLOSED": 0
  },
  "byCategory": {
    "POTHOLES": 45,
    "WASTE_MANAGEMENT": 35,
    "ELECTRICITY": 25,
    "WATER": 20,
    "SANITATION": 15,
    "SECURITY": 10
  },
  "byPriority": {
    "LOW": 20,
    "MEDIUM": 50,
    "HIGH": 60,
    "URGENT": 20
  },
  "averageResolutionTime": 1200,
  "slaComplianceRate": 92.5,
  "resolutionRate": 35.0
}
```

### Export Complaints Report
```
POST /api/complaints/export
Headers: Authorization: Bearer TOKEN
Body: {
  "format": "csv",
  "filters": {
    "status": ["RESOLVED", "CLOSED"],
    "category": "POTHOLES",
    "fromDate": "2024-01-01",
    "toDate": "2024-02-29"
  }
}
Response: {
  "success": true,
  "fileUrl": "https://...",
  "format": "csv",
  "recordCount": 45,
  "generatedAt": "2024-02-22T..."
}
```

---

## 👥 Team Endpoints

### Create Team
```
POST /api/teams
Headers: Authorization: Bearer TOKEN
Body: {
  "name": "Pothole Repair Team",
  "department": "department_id",
  "description": "Responsible for pothole repairs",
  "maxCapacity": 50,
  "leader": "user_id"
}
Response: {
  "id": "team_id",
  "name": "Pothole Repair Team",
  "department": { "name": "Infrastructure" },
  "maxCapacity": 50,
  "currentLoad": 0,
  "availabilityStatus": "AVAILABLE",
  "members": []
}
```

### Get All Teams
```
GET /api/teams?department=dept_id&page=1&limit=20
Response: {
  "teams": [
    {
      "id": "team_1",
      "name": "Team A",
      "department": { "name": "Infrastructure" },
      "maxCapacity": 50,
      "currentLoad": 25,
      "availabilityStatus": "AVAILABLE",
      "memberCount": 5,
      "performanceMetrics": {
        "totalAssigned": 100,
        "totalResolved": 92,
        "averageResolutionTime": 1440,
        "slaComplianceRate": 95.5,
        "overallRating": 4.7,
        "resolutionRate": 92.0
      }
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 1
}
```

### Get Team Details
```
GET /api/teams/:id
Response: {
  "id": "team_id",
  "name": "Pothole Repair Team",
  "department": { "id": "...", "name": "Infrastructure" },
  "description": "...",
  "maxCapacity": 50,
  "currentLoad": 30,
  "availabilityStatus": "AVAILABLE",
  "members": [
    {
      "id": "user_1",
      "name": "Mike Johnson",
      "email": "mike@...",
      "phone": "555-1234",
      "joinDate": "2024-01-15"
    }
  ],
  "performanceMetrics": {
    "totalAssigned": 120,
    "totalResolved": 110,
    "pending": 10,
    "inProgress": 5,
    "overdue": 2,
    "averageResolutionTime": 1200,
    "slaComplianceRate": 91.7,
    "resolutionRate": 91.7,
    "capacityUtilization": 60.0,
    "overallRating": 4.5
  },
  "recentComplaints": [
    { "trackingId": "CVC-2024-0001", "status": "IN_PROGRESS" }
  ]
}
```

### Add Team Member
```
POST /api/teams/:id/members
Headers: Authorization: Bearer TOKEN
Body: {
  "userId": "user_id"
}
Response: {
  "success": true,
  "message": "User added to team",
  "memberCount": 6
}
```

### Get Team Performance
```
GET /api/teams/:id/performance
Response: {
  "teamId": "team_id",
  "teamName": "Pothole Repair Team",
  "period": "2024-02",
  "metrics": {
    "totalAssigned": 45,
    "resolved": 40,
    "pending": 3,
    "inProgress": 2,
    "overdue": 0,
    "averageResolutionTime": 1200,
    "slaComplianceRate": 100.0,
    "resolutionRate": 88.9,
    "capacityUtilization": 90.0,
    "memberUtilization": [
      { "member": "Mike", "assignedComplaints": 15, "resolved": 14 },
      { "member": "Jane", "assignedComplaints": 12, "resolved": 11 }
    ]
  }
}
```

### Bulk Assign Complaints
```
POST /api/teams/:id/bulk-assign
Headers: Authorization: Bearer TOKEN
Body: {
  "complaintIds": ["comp_1", "comp_2", "comp_3"]
}
Response: {
  "success": true,
  "totalRequested": 3,
  "successCount": 2,
  "failureCount": 1,
  "failures": [
    {
      "complaintId": "comp_2",
      "reason": "Team at maximum capacity"
    }
  ]
}
```

---

## 📊 Supervisor Analytics Endpoints

### Get Supervisor Dashboard
```
GET /api/supervisor/dashboard?month=2024-02
Response: {
  "summary": {
    "totalComplaints": 250,
    "resolvedComplaints": 180,
    "pendingComplaints": 50,
    "inProgressComplaints": 20,
    "overdueComplaints": 5,
    "averageResolutionTime": 1440,
    "slaComplianceRate": 93.2,
    "resolutionRate": 72.0
  },
  "departmentBreakdown": [
    {
      "name": "Infrastructure",
      "totalComplaints": 100,
      "resolved": 85,
      "pending": 10,
      "inProgress": 5,
      "overdue": 2,
      "resolutionRate": 85.0
    }
  ],
  "teamRankings": [
    {
      "rank": 1,
      "teamName": "Team A",
      "department": "Infrastructure",
      "resolved": 45,
      "pending": 5,
      "overallRating": 4.8,
      "slaCompliance": 96.0
    }
  ],
  "categoryDistribution": {
    "POTHOLES": 80,
    "WASTE_MANAGEMENT": 60,
    "ELECTRICITY": 45,
    "WATER": 40,
    "SANITATION": 25
  },
  "priorityDistribution": {
    "LOW": 50,
    "MEDIUM": 100,
    "HIGH": 80,
    "URGENT": 20
  },
  "monthlyTrends": [
    {
      "month": "2024-01",
      "total": 280,
      "resolved": 200,
      "pending": 55,
      "inProgress": 20,
      "overdue": 5
    },
    {
      "month": "2024-02",
      "total": 250,
      "resolved": 180,
      "pending": 50,
      "inProgress": 20,
      "overdue": 5
    }
  ]
}
```

### Get Overdue Alerts
```
GET /api/supervisor/overdue-alerts?limit=20
Response: {
  "overdue": [
    {
      "trackingId": "CVC-2024-0001",
      "complaintType": "Potholes",
      "category": "POTHOLES",
      "priority": "HIGH",
      "locality": "Downtown",
      "daysOverdue": 3,
      "deadline": "2024-02-20T10:00:00Z",
      "assignedTeam": { "name": "Team A" },
      "citizenName": "John Doe",
      "citizenPhone": "555-1234",
      "status": "IN_PROGRESS"
    }
  ],
  "total": 5,
  "criticalCount": 2
}
```

### Get SLA Violation Trends
```
GET /api/supervisor/sla-violations?month=2024-02
Response: {
  "byCategory": {
    "POTHOLES": { "total": 10, "violated": 3, "rate": 30.0 },
    "WATER": { "total": 8, "violated": 1, "rate": 12.5 }
  },
  "byMonth": {
    "2024-01": { "total": 20, "violated": 4, "rate": 20.0 },
    "2024-02": { "total": 18, "violated": 2, "rate": 11.1 }
  },
  "byTeam": {
    "Team A": { "total": 15, "violated": 2, "rate": 13.3 },
    "Team B": { "total": 12, "violated": 3, "rate": 25.0 }
  }
}
```

### Get Area Heatmap Data
```
GET /api/supervisor/heatmap?radius=100
Response: {
  "hotspots": [
    {
      "coordinates": [-74.0060, 40.7128],
      "complaintCount": 15,
      "category": "POTHOLES",
      "address": "Main Street & 5th Avenue",
      "intensity": 0.95
    },
    {
      "coordinates": [-74.0100, 40.7150],
      "complaintCount": 12,
      "category": "WATER",
      "address": "Park Avenue & 10th Street",
      "intensity": 0.88
    }
  ],
  "totalHotspots": 8,
  "mapCenter": [-74.0060, 40.7128],
  "mapZoom": 13
}
```

### Get Activity Timeline
```
GET /api/supervisor/activity-timeline?limit=50
Response: {
  "activities": [
    {
      "timestamp": "2024-02-22T14:30:00Z",
      "action": "STATUS_CHANGED",
      "user": { "name": "Mike Johnson", "role": "TEAM_MEMBER" },
      "complaint": { "trackingId": "CVC-2024-0001", "complaintType": "Potholes" },
      "details": "Status changed from ASSIGNED to IN_PROGRESS",
      "oldValue": "ASSIGNED",
      "newValue": "IN_PROGRESS"
    }
  ],
  "total": 247
}
```

### Get Department Comparison
```
GET /api/supervisor/department-comparison
Response: {
  "departments": [
    {
      "name": "Infrastructure",
      "totalComplaints": 100,
      "resolvedComplaints": 85,
      "pendingComplaints": 10,
      "inProgressComplaints": 4,
      "overdueComplaints": 1,
      "averageResolutionTime": 1200,
      "resolutionRate": 85.0,
      "slaComplianceRate": 98.0,
      "teamCount": 2,
      "performance": "EXCELLENT"
    }
  ]
}
```

### Export Supervisor Report
```
POST /api/supervisor/export-report
Headers: Authorization: Bearer TOKEN
Body: {
  "format": "csv",
  "includeData": [
    "summary",
    "department_breakdown",
    "team_rankings",
    "monthly_trends",
    "overdue_alerts"
  ],
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-02-29"
  }
}
Response: {
  "success": true,
  "fileUrl": "https://...",
  "format": "csv",
  "generatedAt": "2024-02-22T..."
}
```

---

## 📱 Notification Endpoints

### Get User Notifications
```
GET /api/notifications?unreadOnly=false&limit=20
Response: {
  "notifications": [
    {
      "id": "notif_1",
      "type": "COMPLAINT_ASSIGNED",
      "title": "Complaint Assigned",
      "message": "Your complaint has been assigned to Team A",
      "complaintId": "complaint_1",
      "read": false,
      "createdAt": "2024-02-22T14:00:00Z",
      "readAt": null
    }
  ],
  "unreadCount": 3,
  "total": 25
}
```

### Mark Notification as Read
```
PUT /api/notifications/:id/read
Response: {
  "success": true,
  "notification": { "id": "...", "read": true, "readAt": "..." }
}
```

---

## 🔄 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "details": {
    "field": "complaintType",
    "message": "Field is required"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_INPUT` | 400 | Missing or invalid field |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🔐 Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1708632000
```

Limits:
- Public endpoints: 30 requests/minute
- Authenticated endpoints: 300 requests/minute
- File upload: 10 requests/minute

---

## 📝 Pagination

All list endpoints support pagination:

```
?page=1&limit=20&sort=createdAt&order=desc
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "pages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🧪 API Testing

### Using Postman Collection
Import: `postman_collection.json`

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@civiccare.com", "password": "pass123"}'

# Get Dashboard
curl -X GET http://localhost:5000/api/supervisor/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Insomnia
Import: `insomnia_collection.json`

---

## 📚 Documentation

- Full API docs: [https://api.civiccare.com/docs](https://api.civiccare.com/docs)
- WebSocket events: See Socket.io documentation
- Data schemas: See database documentation

---

**Version**: 2.0
**Last Updated**: February 22, 2024
**API Base**: `http://localhost:5000/api`

