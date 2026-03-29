import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { joinAdminChannel } from '../services/socketService';
import { AlertTriangle, CheckCircle, Clock, FolderKanban, Users } from 'lucide-react';

const departmentMeta = {
  WASTE_MANAGEMENT: { label: 'Waste Management', icon: '🗑️', description: 'Garbage collection, dumping, and recycling issues.' },
  POTHOLES: { label: 'Potholes / Road', icon: '🛣️', description: 'Road damage, potholes, and related public works issues.' },
  ELECTRICITY: { label: 'Electricity', icon: '⚡', description: 'Power outages, street lights, and electrical faults.' },
  WATER: { label: 'Water Supply', icon: '💧', description: 'Water leaks, shortages, and supply quality complaints.' },
  SANITATION: { label: 'Sanitation', icon: '🚽', description: 'Drainage, toilets, sewage, and hygiene issues.' },
  PUBLIC_PROPERTY: { label: 'Public Property', icon: '🏢', description: 'Damage to public buildings and infrastructure.' },
  E_WASTE: { label: 'E-Waste', icon: '♻️', description: 'Electronic waste collection and disposal issues.' },
  SECURITY: { label: 'Security', icon: '🛡️', description: 'Safety and public security concerns.' },
  HEALTH: { label: 'Health & Hygiene', icon: '🏥', description: 'Public health and hygiene complaints.' },
  ENVIRONMENT: { label: 'Environment', icon: '🌱', description: 'Pollution, green cover, and environmental concerns.' },
  TRANSPORT: { label: 'Transport', icon: '🚗', description: 'Traffic, parking, and public transport issues.' },
  EDUCATION: { label: 'Education', icon: '📚', description: 'School infrastructure and education-related complaints.' },
};

const normalizeAdminDepartment = (department) => {
  const mapping = {
    ROAD_MAINTENANCE: 'POTHOLES',
  };

  return mapping[department] || department;
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const adminCategory = normalizeAdminDepartment(user?.department);
  const department = departmentMeta[adminCategory];

  useEffect(() => {
    if (!adminCategory) {
      setError('Your admin account is not linked to a department yet.');
      setLoading(false);
      return;
    }

    joinAdminChannel(adminCategory);
    fetchDashboard(adminCategory);
  }, [adminCategory]);

  const fetchDashboard = async (category) => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getDepartmentComplaints(category);
      setStats(response.data.stats);
      setComplaints(response.data.complaints || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your department dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-24">
        <div className="text-white text-xl">Loading your department dashboard...</div>
      </div>
    );
  }

  if (!adminCategory || !department) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-24">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-3">Department not configured</h1>
          <p className="text-gray-400">{error || 'Please contact support to link this admin account to a department.'}</p>
        </div>
      </div>
    );
  }

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span className="text-4xl">{department.icon}</span>
              {department.label} Dashboard
            </h1>
            <p className="text-gray-400">
              Signed in as {user?.name}. This dashboard only shows your department data.
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/department/${adminCategory}`)}
            className="px-5 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
          >
            Open Full Department View
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-2">{department.label}</h2>
          <p className="text-gray-400">{department.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Complaints</p>
                <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold mt-1 text-yellow-400">{stats?.pending || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold mt-1 text-purple-400">{stats?.inProgress || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{stats?.resolved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h3 className="text-xl font-semibold">Recent Complaints</h3>
              <p className="text-sm text-gray-400">Latest complaints assigned to your department only.</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          {recentComplaints.length === 0 ? (
            <div className="p-6 text-gray-400">No complaints found for this department.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint._id || complaint.id} className="hover:bg-gray-700/40">
                      <td className="px-6 py-4 text-sm text-gray-300">#{complaint.id}</td>
                      <td className="px-6 py-4 text-sm text-white">{complaint.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{complaint.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{complaint.citizenId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
