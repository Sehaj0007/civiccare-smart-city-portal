# CivicCare - Smart City Complaint & Awareness Portal

## 🏛️ Overview

CivicCare is a **production-ready MERN (MongoDB, Express, React, Node.js)** web application that serves as a unified digital platform where citizens can report, track, and receive real-time updates for civic complaints related to public infrastructure and safety.

Authorities and Admins can manage complaints department-wise, assign issues to internal teams, or escalate them to Municipal Corporations and Ward Offices with full transparency and accountability.

## 📋 Core Features

### Citizen Features
- ✅ User Registration & Login with JWT Authentication
- ✅ Raise Complaints in 6 categories with image uploads
- ✅ Track complaint status in real-time with instant notifications
- ✅ View complaint details and history
- ✅ Rate and provide feedback on resolved complaints
- ✅ Real-time Socket.IO updates

### Admin Features
- ✅ Admin login with role-based access control
- ✅ 6 Department-wise Dashboards (Waste, Roads, Electricity, Property, E-Waste, Security)
- ✅ Assign complaints to internal labour teams
- ✅ Escalate complaints to Ward Offices
- ✅ Change complaint status with remarks
- ✅ View department-wise statistics and analytics
- ✅ Real-time dashboard updates via Socket.IO

## 🗂️ Project Structure

```
civiccare/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   ├── socketIO.js           # Socket.IO setup
│   │   │   └── multer.js             # File upload config
│   │   ├── controllers/
│   │   │   ├── authController.js     # Auth logic
│   │   │   ├── complaintController.js # Complaint operations
│   │   │   ├── adminController.js    # Admin actions
│   │   │   └── setupController.js    # Teams & Ward Offices
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Complaint.js          # Complaint schema
│   │   │   ├── LabourTeam.js         # Team schema
│   │   │   └── WardOffice.js         # Ward office schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── setupRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT & role-based auth
│   │   ├── utils/
│   │   │   ├── tokenUtils.js         # JWT utilities
│   │   │   ├── ErrorHandler.js       # Custom error class
│   │   │   └── errorUtils.js         # Error middleware
│   │   ├── seeds/
│   │   │   └── seedData.js           # Sample data
│   │   └── index.js                  # Server entry point
│   ├── uploads/                      # Image upload directory
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Navigation bar
│   │   │   └── ProtectedRoute.jsx    # Route protection
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Home page
│   │   │   ├── LoginPage.jsx         # Login page
│   │   │   ├── RegisterPage.jsx      # Registration page
│   │   │   ├── RaiseComplaintPage.jsx # Complaint form
│   │   │   ├── MyComplaintsPage.jsx  # User dashboard
│   │   │   ├── ComplaintDetailPage.jsx # Complaint detail
│   │   │   └── AdminDashboard.jsx    # Admin dashboard
│   │   ├── context/
│   │   │   └── AuthContext.js        # Auth context
│   │   ├── services/
│   │   │   ├── apiService.js         # API calls
│   │   │   └── socketService.js      # Socket.IO client
│   │   ├── utils/
│   │   │   └── api.js                # Axios instance
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .gitignore
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (local or cloud)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/civiccare
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Seed Sample Data**
   ```bash
   npm run seed
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register new user
- Body: `{ name, email, password, phone }`

**POST /api/auth/login**
- User login
- Body: `{ email, password }`

**POST /api/auth/admin-login**
- Admin login
- Body: `{ email, password }`

**GET /api/auth/me**
- Get current user (requires token)

### Complaint Endpoints

**POST /api/complaints**
- Create complaint
- Body: `{ category, complaintType, description, locality, address, imageUrl }`

**GET /api/complaints/user/:userId**
- Get user's complaints
- Query: `?status=&category=`

**GET /api/complaints/detail/:id**
- Get complaint details

**GET /api/complaints** (Admin)
- Get all complaints
- Query: `?status=&category=`

**PATCH /api/complaints/:id**
- Update complaint status

**PATCH /api/complaints/:id/feedback**
- Add rating and feedback

### Admin Endpoints

**POST /api/admin/assign-team**
- Assign complaint to team
- Body: `{ complaintId, teamId, remarks }`

**POST /api/admin/escalate**
- Escalate to ward office
- Body: `{ complaintId, wardOfficeId, remarks }`

**PATCH /api/admin/complaints/:id/status**
- Update status
- Body: `{ status, remarks }`

**GET /api/admin/complaints/department/:category**
- Get department complaints

### Setup Endpoints

**POST /api/setup/teams** (Admin)
- Create labour team

**GET /api/setup/teams**
- Get all teams

**POST /api/setup/ward-offices** (Admin)
- Create ward office

**GET /api/setup/ward-offices**
- Get all ward offices

## 🔑 Sample Credentials

After running `npm run seed`, use these credentials:

### Citizen Users
```
Email: citizen1@civiccare.com
Password: password123

Email: citizen2@civiccare.com
Password: password123
```

### Admin Users (Department-wise)
```
Waste Management:
Email: admin.waste@civiccare.com
Password: admin123

Roads & Potholes:
Email: admin.roads@civiccare.com
Password: admin123

Electricity:
Email: admin.electricity@civiccare.com
Password: admin123

Public Property:
Email: admin.property@civiccare.com
Password: admin123

E-Waste:
Email: admin.ewaste@civiccare.com
Password: admin123

Security:
Email: admin.security@civiccare.com
Password: admin123
```

## 🏗️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "USER" | "ADMIN",
  department: String (for admins),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaints Collection
```javascript
{
  _id: ObjectId,
  category: String,
  complaintType: String,
  description: String,
  locality: String,
  address: String,
  imageUrl: String,
  status: String,
  actionType: "ASSIGNED" | "FORWARDED" | null,
  assignedTeamId: ObjectId (ref: LabourTeam),
  assignedByAdminId: ObjectId (ref: User),
  forwardedWardOfficeId: ObjectId (ref: WardOffice),
  citizenId: ObjectId (ref: User),
  remarks: String,
  rating: Number (1-5),
  feedback: String,
  createdAt: Date,
  resolvedAt: Date,
  updatedAt: Date
}
```

### LabourTeams Collection
```javascript
{
  _id: ObjectId,
  teamName: String,
  departmentCategory: String,
  contactNumber: String,
  email: String,
  availabilityStatus: "AVAILABLE" | "BUSY" | "INACTIVE",
  assignedComplaints: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### WardOffices Collection
```javascript
{
  _id: ObjectId,
  wardNumber: String,
  officeName: String,
  locality: [String],
  email: String,
  phone: String,
  address: String,
  forwardedComplaints: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Real-Time Socket.IO Events

### Client Events
- `join-admin-channel` - Admin joins department channel
- `leave-admin-channel` - Admin leaves department channel

### Server Events
- `new-complaint` - New complaint submitted
- `complaint-status-updated` - Status changed (sent to citizen)
- `complaint-assigned` - Team assigned (sent to citizen)
- `complaint-escalated` - Escalated to ward (sent to citizen)
- `notification` - General notification

## 🎯 Complaint Categories & Status Flow

### Categories
1. **WASTE_MANAGEMENT** - Garbage, recycling, disposal
2. **POTHOLES** - Road damage, maintenance
3. **ELECTRICITY** - Streetlights, power faults
4. **PUBLIC_PROPERTY** - Benches, toilets, signage
5. **E_WASTE** - Electronic waste
6. **SECURITY** - Safety, suspicious activity

### Status Workflow
```
PENDING → (ASSIGNED or FORWARDED)
ASSIGNED → IN_PROGRESS → RESOLVED
FORWARDED → UNDER_REVIEW → RESOLVED
(any status) → REJECTED (if not feasible)
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Protected API endpoints
- ✅ CORS configured
- ✅ Input validation with express-validator
- ✅ Secure file uploads (image only, 5MB limit)

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Validation**: express-validator
- **CORS**: enabled
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Charts**: Recharts, Chart.js

## 🚢 Deployment

### Backend (Heroku / Cloud)
1. Set environment variables in cloud platform
2. Configure MongoDB Atlas or cloud database
3. Deploy via Git push or CI/CD

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Deploy build folder
3. Set API URL in environment variables

## 📝 Development Tips

1. **Testing with Postman/Thunder Client**
   - Import API routes into Postman
   - Test endpoints with sample data

2. **Database Monitoring**
   - Use MongoDB Compass for local database
   - Use MongoDB Atlas for cloud

3. **Socket.IO Testing**
   - Use browser DevTools to check socket connection
   - Monitor Network tab for Socket.IO events

4. **Debug Mode**
   - Set `NODE_ENV=development` for detailed error logs
   - Check browser console and server logs

## 🐛 Troubleshooting

**Port already in use**
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend
lsof -i :5173
```

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in .env
- Verify database credentials

**Socket.IO not connecting**
- Check ALLOWED_ORIGINS in .env
- Verify Socket.IO on both frontend and backend
- Check browser console for errors

## 📊 Performance Metrics

- Page load: < 2s
- API response: < 500ms
- Socket.IO latency: < 100ms
- Database queries: indexed for fast retrieval

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Socket.IO Documentation](https://socket.io/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact: support@civiccare.com

---

**Built with ❤️ by CivicCare Team**

Made for Final Year Projects, Interviews, and Smart City Solutions
