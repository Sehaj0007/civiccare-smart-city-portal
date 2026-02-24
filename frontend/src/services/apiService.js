import api from '../utils/api';

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
};

// Complaint Services
export const complaintService = {
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  getUserComplaints: (userId, params) => api.get(`/complaints/user/${userId}`, { params }),
  getComplaintById: (id) => api.get(`/complaints/detail/${id}`),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  updateComplaint: (id, data) => api.patch(`/complaints/${id}`, data),
  addFeedback: (id, data) => api.patch(`/complaints/${id}/feedback`, data),
  getStats: () => api.get('/complaints/stats/overview'),
};

// Admin Services
export const adminService = {
  assignTeam: (data) => api.post('/admin/assign-team', data),
  escalateComplaint: (data) => api.post('/admin/escalate', data),
  updateStatus: (id, data) => api.patch(`/admin/complaints/${id}/status`, data),
  getDepartmentComplaints: (category, params) => api.get(`/admin/complaints/department/${category}`, { params }),
};

// Setup Services
export const setupService = {
  // Teams
  createTeam: (data) => api.post('/setup/teams', data),
  getAllTeams: (params) => api.get('/setup/teams', { params }),
  getTeamsByCategory: (category) => api.get(`/setup/teams/by-category/${category}`),
  updateTeam: (id, data) => api.patch(`/setup/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/setup/teams/${id}`),

  // Ward Offices
  createWardOffice: (data) => api.post('/setup/ward-offices', data),
  getAllWardOffices: () => api.get('/setup/ward-offices'),
  getWardOfficeByLocality: (locality) => api.get(`/setup/ward-offices/locality/${locality}`),
  updateWardOffice: (id, data) => api.patch(`/setup/ward-offices/${id}`, data),
  deleteWardOffice: (id) => api.delete(`/setup/ward-offices/${id}`),
};
