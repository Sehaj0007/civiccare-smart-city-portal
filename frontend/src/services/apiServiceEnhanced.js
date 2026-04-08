import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Complaint Service
export const complaintService = {
  // Enhanced complaint creation with AI detection
  createComplaint: (data) => api.post('/complaints/create', data),
  
  // Get all complaints with filters
  getAllComplaints: (filters = {}) => api.get('/complaints', { params: filters }),
  
  // Get complaint by ID
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  
  // Update complaint status with SLA tracking
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  
  // Assign complaint to team
  assignToTeam: (id, data) => api.patch(`/complaints/${id}/assign-team`, data),
  
  // Get complaint analytics
  getAnalytics: (filters = {}) => api.get('/complaints/analytics/summary', { params: filters }),
  
  // Export complaints as CSV/PDF
  exportReport: (format = 'csv', filters = {}) => 
    api.get('/complaints/export/pdf', { params: { format, ...filters }, responseType: 'blob' }),
};

// Team Service
export const teamService = {
  // Create team
  createTeam: (data) => api.post('/teams', data),
  
  // Get all teams
  getAllTeams: (filters = {}) => api.get('/teams', { params: filters }),
  
  // Get team by ID
  getTeamById: (id) => api.get(`/teams/${id}`),
  
  // Update team
  updateTeam: (id, data) => api.patch(`/teams/${id}`, data),
  
  // Add team member
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members`, { userId }),
  
  // Remove team member
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
  
  // Get team performance metrics
  getPerformance: (id) => api.get(`/teams/${id}/performance`),
  
  // Bulk assign complaints
  bulkAssign: (teamId, data) => api.post(`/teams/${teamId}/bulk-assign`, data),
};

// Supervisor Service
export const supervisorService = {
  // Get comprehensive dashboard
  getDashboard: (params = {}) => api.get('/supervisor/dashboard', { params }),
  
  // Get overdue alerts
  getOverdueAlerts: () => api.get('/supervisor/alerts/overdue'),
  
  // Get SLA violation trends
  getSLAViolations: () => api.get('/supervisor/analytics/sla-violations'),
  
  // Get area heatmap
  getHeatmap: () => api.get('/supervisor/analytics/heatmap'),
  
  // Get activity timeline
  getActivityTimeline: (limit = 50) => api.get('/supervisor/activity/timeline', { params: { limit } }),
  
  // Get department comparison
  getDepartmentComparison: () => api.get('/supervisor/analytics/department-comparison'),
  
  // Export supervisor report
  exportReport: (format = 'json', filters = {}) => 
    api.get('/supervisor/reports/export', { params: { format, ...filters } }),
};

// Notification Service
export const notificationService = {
  // Get user notifications
  getNotifications: (unreadOnly = false, limit = 20) => 
    api.get('/notifications', { params: { unreadOnly, limit } }),
  
  // Mark notification as read
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  
  // Mark all as read
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  
  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Activity Log Service
export const activityService = {
  // Get activity logs
  getLogs: (filters = {}) => api.get('/activities', { params: filters }),
  
  // Get complaint activity
  getComplaintActivity: (complaintId) => api.get(`/activities/complaint/${complaintId}`),
};

// Department Service
export const departmentService = {
  // Get all departments
  getAllDepartments: () => api.get('/departments'),
  
  // Get department by ID
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  
  // Get department stats
  getDepartmentStats: (id) => api.get(`/departments/${id}/stats`),
};

export default api;
