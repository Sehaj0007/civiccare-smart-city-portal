import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { joinAdminChannel } from '../services/socketService';
import { TrendingUp, Bell, Settings, RefreshCw, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewStats, setOverviewStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pending');
  const [lastUpdated, setLastUpdated] = useState(null);

  const categories = [
    { id: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: '🗑️', color: 'bg-green-500/20 text-green-400', description: 'Garbage collection, dumping, recycling' },
    { id: 'POTHOLES', label: 'Potholes / Road', icon: '🛣️', color: 'bg-orange-500/20 text-orange-400', description: 'Road repairs, potholes, traffic signals' },
    { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡', color: 'bg-yellow-500/20 text-yellow-400', description: 'Power outages, street lights, transformers' },
    { id: 'WATER', label: 'Water Supply', icon: '💧', color: 'bg-blue-500/20 text-blue-400', description: 'Water leaks, supply issues, quality' },
    { id: 'SANITATION', label: 'Sanitation', icon: '🚽', color: 'bg-purple-500/20 text-purple-400', description: 'Public toilets, drainage, sewage' },
    { id: 'PUBLIC_PROPERTY', label: 'Public Property', icon: '🏢', color: 'bg-indigo-500/20 text-indigo-400', description: 'Vandalism, damaged infrastructure' },
    { id: 'E_WASTE', label: 'E-Waste', icon: '♻️', color: 'bg-teal-500/20 text-teal-400', description: 'Electronic waste disposal' },
    { id: 'SECURITY', label: 'Security', icon: '🛡️', color: 'bg-red-500/20 text-red-400', description: 'Crime reports, safety concerns' },
    { id: 'HEALTH', label: 'Health & Hygiene', icon: '🏥', color: 'bg-pink-500/20 text-pink-400', description: 'Medical waste, hygiene issues' },
    { id: 'ENVIRONMENT', label: 'Environment', icon: '🌱', color: 'bg-emerald-500/20 text-emerald-400', description: 'Pollution, tree cutting, wildlife' },
    { id: 'TRANSPORT', label: 'Transport', icon: '🚗', color: 'bg-cyan-500/20 text-cyan-400', description: 'Parking, traffic, public transport' },
    { id: 'EDUCATION', label: 'Education', icon: '📚', color: 'bg-violet-500/20 text-violet-400', description: 'School facilities, education quality' },
  ];

  useEffect(() => {
    fetchOverviewStats();

    // Join admin channels for all categories
    categories.forEach(cat => {
      joinAdminChannel(cat.id);
    });
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const statsMap = {};

      // Fetch categories sequentially with retries and small delay to avoid triggering rate limits
      for (const category of categories) {
        let attempts = 0;
        const maxAttempts = 1;
        while (attempts < maxAttempts) {
          try {
            const res = await adminService.getDepartmentComplaints(category.id);
            statsMap[category.id] = {
              categoryId: category.id,
              stats: res.data.stats,
              total: res.data.complaints.length,
            };
            break; // success, exit retry loop
          } catch (err) {
            attempts += 1;
            const status = err?.response?.status;
            if (status === 429 && attempts < maxAttempts) {
              // Backoff before retrying
              const backoffMs = 300 * attempts;
              await new Promise((r) => setTimeout(r, backoffMs));
              continue;
            } else {
              console.error(`Failed to fetch stats for ${category.id}:`, err);
              statsMap[category.id] = {
                categoryId: category.id,
                stats: { pending: 0, assigned: 0, inProgress: 0, resolved: 0 },
                total: 0,
              };
              break;
            }
          }
        }

        // brief delay between category requests to avoid burst traffic
        await new Promise((r) => setTimeout(r, 1000));
      }

      setOverviewStats(statsMap);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToDepartment = (categoryId) => {
    navigate(`/admin/department/${categoryId}`);
  };

  const totalComplaints = useMemo(
    () => categories.reduce((sum, cat) => sum + (overviewStats[cat.id]?.total || 0), 0),
    [overviewStats]
  );

  const totalPending = useMemo(
    () => categories.reduce((sum, cat) => sum + (overviewStats[cat.id]?.stats?.pending || 0), 0),
    [overviewStats]
  );

  const departmentsWithPending = useMemo(
    () => categories.filter((cat) => (overviewStats[cat.id]?.stats?.pending || 0) > 0).length,
    [overviewStats]
  );

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = categories.filter((cat) => {
      if (!term) return true;
      return (
        cat.label.toLowerCase().includes(term) ||
        cat.description.toLowerCase().includes(term) ||
        cat.id.toLowerCase().includes(term)
      );
    });

    return [...list].sort((a, b) => {
      const aPending = overviewStats[a.id]?.stats?.pending || 0;
      const bPending = overviewStats[b.id]?.stats?.pending || 0;
      const aTotal = overviewStats[a.id]?.total || 0;
      const bTotal = overviewStats[b.id]?.total || 0;

      if (sortBy === 'total') return bTotal - aTotal;
      if (sortBy === 'name') return a.label.localeCompare(b.label);
      return bPending - aPending;
    });
  }, [searchTerm, sortBy, overviewStats]);

  const pendingPriority = useMemo(
    () =>
      [...categories]
        .map((cat) => ({
          ...cat,
          pending: overviewStats[cat.id]?.stats?.pending || 0,
          total: overviewStats[cat.id]?.total || 0,
        }))
        .sort((a, b) => b.pending - a.pending)
        .slice(0, 5),
    [overviewStats]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage civic complaints across all departments</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-lg backdrop-blur-xl animate-fadeIn mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Total Complaints</p>
            <p className="text-2xl font-bold text-white mt-1">{totalComplaints}</p>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{totalPending}</p>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <p className="text-gray-400 text-sm">Departments With Pending</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{departmentsWithPending}</p>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-green-400" />
              Department Overview
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search department..."
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Sort: Pending</option>
                <option value="total">Sort: Total</option>
                <option value="name">Sort: Name</option>
              </select>
              <button
                onClick={fetchOverviewStats}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Not available'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => navigateToDepartment(category.id)}
                className={`relative bg-gray-700 rounded-xl p-6 border border-gray-600 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden group ${category.color}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{category.icon}</span>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.label}</h3>
                  <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total: <span className="text-white font-semibold">{overviewStats[category.id]?.total || 0}</span></span>
                    <span className="text-gray-400">Pending: <span className="text-yellow-400 font-semibold">{overviewStats[category.id]?.stats?.pending || 0}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { time: '2 min ago', action: 'New complaint in Waste Management', type: 'new' },
                { time: '15 min ago', action: 'Complaint resolved in Electricity', type: 'resolved' },
                { time: '1 hour ago', action: 'Team assigned to Potholes complaint', type: 'assigned' },
                { time: '2 hours ago', action: 'Complaint escalated in Security', type: 'escalated' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'new' ? 'bg-blue-500' :
                    activity.type === 'resolved' ? 'bg-green-500' :
                    activity.type === 'assigned' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Priority */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Pending Priority
            </h3>
            <div className="space-y-4">
              {pendingPriority.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div>
                    <p className="text-white font-medium">{dept.label}</p>
                    <p className="text-xs text-gray-400">Total: {dept.total}</p>
                  </div>
                  <button
                    onClick={() => navigateToDepartment(dept.id)}
                    className="px-3 py-1.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-sm font-semibold hover:bg-yellow-500/30"
                  >
                    Pending: {dept.pending}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
