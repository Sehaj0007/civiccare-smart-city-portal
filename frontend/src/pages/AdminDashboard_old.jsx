import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, setupService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { joinAdminChannel } from '../services/socketService';
import { TrendingUp, Users, AlertTriangle, CheckCircle, MapPin, Download, Filter, Search, Bell, Settings } from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewStats, setOverviewStats] = useState({});
  const isInitialLoad = useRef(true);

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
        const maxAttempts = 3;
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
        await new Promise((r) => setTimeout(r, 120));
      }

      setOverviewStats(statsMap);
    } catch (err) {
      console.error('Failed to fetch overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToDepartment = (categoryId) => {
    navigate(`/admin/department/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
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

        {/* Department Overview */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-400" />
            Department Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => (
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

          {/* System Status */}
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              System Status
            </h3>
            <div className="space-y-4">
              {[
                { service: 'Database', status: 'Operational', color: 'text-green-400' },
                { service: 'API Server', status: 'Operational', color: 'text-green-400' },
                { service: 'File Storage', status: 'Operational', color: 'text-green-400' },
                { service: 'Email Service', status: 'Maintenance', color: 'text-yellow-400' },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <span className="text-white">{service.service}</span>
                  <span className={`font-semibold ${service.color}`}>{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Update analytics data when complaints change
  useEffect(() => {
    if (complaints.length > 0) {
      const statusCounts = complaints.reduce((acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1;
        return acc;
      }, {});

      const analytics = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count
      }));

      setAnalyticsData(analytics);
    }
  }, [complaints]);

  const fetchDashboardData = async () => {
    if (isDataLoading) return; // Prevent concurrent calls

    setIsDataLoading(true);
    setError('');
    try {
      // Fetch complaints for active category
      const complaintRes = await adminService.getDepartmentComplaints(activeTab);
      setComplaints(complaintRes.data.complaints);
      setStats(complaintRes.data.stats);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsDataLoading(false);
      setLoading(false);
    }
  };

  const fetchTeamsAndWardOffices = async () => {
    try {
      // Fetch teams for active category
      const teamsRes = await setupService.getTeamsByCategory(activeTab);
      // Fetch all ward offices (cached, only fetch once if needed)
      const wardRes = await setupService.getAllWardOffices();

      setTeams(teamsRes.data.teams);
      setWardOffices(wardRes.data.wardOffices);
    } catch (err) {
      console.error('Failed to load teams and ward offices:', err);
    }
  };

  const fetchOverviewStats = async () => {
    try {
      const statsMap = {};

      // Fetch categories sequentially with retries and small delay to avoid triggering rate limits
      for (const category of categories) {
        let attempts = 0;
        const maxAttempts = 3;
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
        await new Promise((r) => setTimeout(r, 120));
      }

      setOverviewStats(statsMap);
    } catch (err) {
      console.error('Failed to fetch overview stats:', err);
    }
  };

  const handleAssignTeam = async () => {
    if (!actionData.teamId) {
      alert('Please select a team');
      return;
    }

    try {
      await adminService.assignTeam({
        complaintId: selectedComplaint._id,
        teamId: actionData.teamId,
        remarks: actionData.remarks,
      });

      alert('Complaint assigned successfully!');
      setShowAssignModal(false);
      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to assign complaint');
    }
  };

  const handleEscalate = async () => {
    if (!actionData.wardOfficeId) {
      alert('Please select a ward office');
      return;
    }

    try {
      await adminService.escalateComplaint({
        complaintId: selectedComplaint._id,
        wardOfficeId: actionData.wardOfficeId,
        remarks: actionData.remarks,
      });

      alert('Complaint escalated successfully!');
      setShowEscalateModal(false);
      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to escalate complaint');
    }
  };

  // Enhanced category navigation functions
  const navigateToCategory = async (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveTab(categoryId);
    setCurrentView('category');
    setSearchTerm('');
    setStatusFilter('ALL');
    setSelectedComplaints([]);

    // Fetch data for the selected category
    try {
      setIsDataLoading(true);
      const complaintRes = await adminService.getDepartmentComplaints(categoryId);
      setComplaints(complaintRes.data.complaints);
      setStats(complaintRes.data.stats);

      // Update analytics for this category
      if (complaintRes.data.complaints.length > 0) {
        const statusCounts = complaintRes.data.complaints.reduce((acc, complaint) => {
          acc[complaint.status] = (acc[complaint.status] || 0) + 1;
          return acc;
        }, {});

        const analytics = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.replace('_', ' '),
          value: count
        }));

        setAnalyticsData(analytics);
      }
    } catch (err) {
      setError('Failed to load category data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const navigateToOverview = () => {
    setCurrentView('overview');
    setSelectedCategory(null);
    setActiveTab('WASTE_MANAGEMENT');
  };

  const handleBulkAction = async (action) => {
    if (selectedComplaints.length === 0) {
      alert('Please select complaints to perform bulk action');
      return;
    }

    try {
      switch (action) {
        case 'assign':
          // Bulk assign logic would go here
          alert(`Bulk assign ${selectedComplaints.length} complaints`);
          break;
        case 'escalate':
          // Bulk escalate logic would go here
          alert(`Bulk escalate ${selectedComplaints.length} complaints`);
          break;
        case 'resolve':
          // Bulk resolve logic would go here
          alert(`Bulk resolve ${selectedComplaints.length} complaints`);
          break;
        default:
          break;
      }
      setSelectedComplaints([]);
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  const toggleComplaintSelection = (complaintId) => {
    setSelectedComplaints(prev =>
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const getPriorityColor = (priority = 'MEDIUM') => {
    const colors = {
      HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      FORWARDED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      UNDER_REVIEW: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Enhanced filtering with priority and sorting
  const filteredComplaints = complaints
    .filter(complaint => {
      const matchesSearch = searchTerm === '' ||
        complaint.complaintType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.citizenId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || (complaint.priority || 'MEDIUM') === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityOrder[b.priority || 'MEDIUM'] || 2) - (priorityOrder[a.priority || 'MEDIUM'] || 2);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7ED957] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section with Navigation */}
        <div className="relative bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7ED957]/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {currentView === 'overview' ? (
                    <>
                      <span className="text-white">Complaint Management</span>
                      <span className="text-[#7ED957]"> Dashboard</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white">{categoryLabel[selectedCategory]}</span>
                      <span className="text-[#7ED957]"> Department</span>
                    </>
                  )}
                </h1>
                <p className="text-gray-400">
                  {currentView === 'overview'
                    ? 'Manage complaints across all departments'
                    : `Detailed view for ${categoryLabel[selectedCategory].toLowerCase()} complaints`
                  }
                </p>
              </div>
              {currentView === 'category' && (
                <button
                  onClick={navigateToOverview}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30"
                >
                  ← Back to Overview
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total Complaints', value: stats?.total || 0, color: 'from-blue-500 to-blue-600', icon: '📊' },
                { label: 'Pending', value: stats?.pending || 0, color: 'from-yellow-500 to-yellow-600', icon: '⏳' },
                { label: 'In Progress', value: stats?.inProgress || 0, color: 'from-purple-500 to-purple-600', icon: '🔄' },
                { label: 'Resolved', value: stats?.resolved || 0, color: 'from-green-500 to-green-600', icon: '✅' }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`relative bg-gradient-to-br from-[#0a0f0a] to-[#1a1f1a] rounded-xl p-4 border border-[#7ED957]/20 transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(to bottom right, ${stat.color})` }}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 font-semibold text-sm">{stat.label}</p>
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-lg backdrop-blur-xl animate-fadeIn">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {currentView === 'overview' ? (
          /* Overview with Category Cards */
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#7ED957]" />
                Department Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    onClick={() => navigateToCategory(category.id)}
                    className={`relative bg-gradient-to-br from-[#0a0f0a] to-[#1a1f1a] rounded-xl p-6 border border-[#7ED957]/20 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden group ${category.color}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(to bottom right, ${category.color.split(' ')[0].replace('bg-', '').replace('-500/20', '')})` }}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl">{category.icon}</span>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{category.label}</h3>
                      <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Active: <span className="text-white font-semibold">{overviewStats[category.id]?.total || 0}</span></span>
                        <span className="text-gray-400">Pending: <span className="text-yellow-400 font-semibold">{overviewStats[category.id]?.stats?.pending || 0}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#7ED957]" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { time: '2 min ago', action: 'New complaint in Waste Management', type: 'new' },
                    { time: '15 min ago', action: 'Complaint resolved in Electricity', type: 'resolved' },
                    { time: '1 hour ago', action: 'Team assigned to Potholes complaint', type: 'assigned' },
                    { time: '2 hours ago', action: 'Complaint escalated in Security', type: 'escalated' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0f0a]/50 rounded-lg border border-[#7ED957]/10">
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

              {/* System Status */}
              <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#7ED957]" />
                  System Status
                </h3>
                <div className="space-y-4">
                  {[
                    { service: 'Database', status: 'Operational', color: 'text-green-400' },
                    { service: 'API Server', status: 'Operational', color: 'text-green-400' },
                    { service: 'File Storage', status: 'Operational', color: 'text-green-400' },
                    { service: 'Email Service', status: 'Maintenance', color: 'text-yellow-400' },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0a0f0a]/50 rounded-lg border border-[#7ED957]/10">
                      <span className="text-white">{service.service}</span>
                      <span className={`font-semibold ${service.color}`}>{service.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Category View */
          <div className="space-y-6">
            {/* Category-specific Controls */}
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white placeholder-gray-400 focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                  >
                    <option value="ALL">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">By Priority</option>
                    <option value="status">By Status</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  {selectedComplaints.length > 0 && (
                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => handleBulkAction('assign')}
                        className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors border border-blue-500/30"
                      >
                        Bulk Assign ({selectedComplaints.length})
                      </button>
                      <button
                        onClick={() => handleBulkAction('resolve')}
                        className="px-4 py-2 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors border border-green-500/30"
                      >
                        Bulk Resolve ({selectedComplaints.length})
                      </button>
                    </div>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Complaints Table with Enhanced Features */}
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
              <div className="px-6 py-4 border-b border-[#7ED957]/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">{categories.find(c => c.id === selectedCategory)?.icon}</span>
                  {categoryLabel[selectedCategory]} Complaints
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''} found
                  {selectedComplaints.length > 0 && ` • ${selectedComplaints.length} selected`}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0f0a]/50 border-b border-[#7ED957]/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedComplaints(filteredComplaints.map(c => c._id));
                            } else {
                              setSelectedComplaints([]);
                            }
                          }}
                          className="rounded border-gray-300 text-[#7ED957] focus:ring-[#7ED957]"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Citizen</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#7ED957]/10">
                    {filteredComplaints.map((complaint, index) => (
                      <tr
                        key={complaint._id}
                        className={`hover:bg-[#7ED957]/5 transition-all duration-200 ${selectedComplaints.includes(complaint._id) ? 'bg-[#7ED957]/10' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedComplaints.includes(complaint._id)}
                            onChange={() => toggleComplaintSelection(complaint._id)}
                            className="rounded border-gray-300 text-[#7ED957] focus:ring-[#7ED957]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority || 'MEDIUM'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">{complaint.complaintType}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white">{complaint.citizenId?.name}</p>
                            <p className="text-sm text-gray-400">{complaint.citizenId?.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{complaint.locality}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)} transition-all duration-200 hover:scale-105 inline-block`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300 text-sm">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setShowViewModal(true);
                              }}
                              className="px-3 py-1 bg-gray-600/50 hover:bg-gray-600 text-white rounded text-sm font-semibold transform transition-all duration-200 hover:scale-105"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setShowAssignModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white rounded text-sm font-semibold transform transition-all duration-200 hover:scale-105"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setShowEscalateModal(true);
                              }}
                              className="px-3 py-1 bg-orange-600/50 hover:bg-orange-600 text-white rounded text-sm font-semibold transform transition-all duration-200 hover:scale-105"
                            >
                              Escalate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredComplaints.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-7xl mb-4">📭</div>
                  <p className="text-gray-400 font-medium text-lg">No complaints found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>

            {/* Category-specific Analytics and Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Map */}
              <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
                <div className="px-6 py-4 border-b border-[#7ED957]/10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#7ED957]" />
                    {categoryLabel[selectedCategory]} Locations
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Complaint hotspots in this department</p>
                </div>
                <div className="h-80">
                  <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredComplaints.map((complaint) => (
                      <Marker
                        key={complaint._id}
                        position={[complaint.latitude || 12.9716, complaint.longitude || 77.5946]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-bold">{complaint.complaintType}</h4>
                            <p className="text-sm">{complaint.locality}</p>
                            <p className="text-sm text-gray-600">Status: {complaint.status}</p>
                            <p className="text-sm text-gray-600">Priority: {complaint.priority || 'MEDIUM'}</p>
                            <p className="text-sm text-gray-600">Citizen: {complaint.citizenId?.name}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>

            {/* Category Analytics - Simple and Colorful */}
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
              <div className="px-6 py-4 border-b border-[#7ED957]/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📊 {categoryLabel[selectedCategory]} Analytics
                </h3>
                <p className="text-sm text-gray-400 mt-1">Simple overview of complaint status</p>
              </div>
              <div className="p-6">
                {/* Simple Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Pending', value: stats?.pending || 0, color: 'bg-yellow-500', icon: '⏳' },
                    { label: 'Assigned', value: stats?.assigned || 0, color: 'bg-blue-500', icon: '👥' },
                    { label: 'In Progress', value: stats?.inProgress || 0, color: 'bg-purple-500', icon: '🔄' },
                    { label: 'Resolved', value: stats?.resolved || 0, color: 'bg-green-500', icon: '✅' }
                  ].map((item, index) => (
                    <div key={item.label} className={`${item.color} rounded-lg p-4 text-white text-center transform hover:scale-105 transition-transform`}>
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm opacity-90">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Simple Progress Bars */}
                <div className="space-y-4">
                  <h4 className="text-white font-semibold mb-3">Status Distribution</h4>
                  {[
                    { label: 'Pending', value: stats?.pending || 0, total: stats?.total || 1, color: 'bg-yellow-500' },
                    { label: 'Assigned', value: stats?.assigned || 0, total: stats?.total || 1, color: 'bg-blue-500' },
                    { label: 'In Progress', value: stats?.inProgress || 0, total: stats?.total || 1, color: 'bg-purple-500' },
                    { label: 'Resolved', value: stats?.resolved || 0, total: stats?.total || 1, color: 'bg-green-500' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-300">{item.label}</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div
                          className={`${item.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${(item.value / item.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm text-white font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600', icon: '📊', border: 'border-blue-500/30' },
              { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-yellow-600', icon: '⏳', border: 'border-yellow-500/30' },
              { label: 'In Progress', value: stats.inProgress, color: 'from-purple-500 to-purple-600', icon: '🔄', border: 'border-purple-500/30' },
              { label: 'Resolved', value: stats.resolved, color: 'from-green-500 to-green-600', icon: '✅', border: 'border-green-500/30' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`relative bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-xl shadow-lg p-6 border ${stat.border} transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-${stat.color.split('-')[1]}-500/20 overflow-hidden group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(to bottom right, ${stat.color})` }}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 font-semibold text-sm">{stat.label}</p>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Complaints Table */}
        <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
          <div className="px-6 py-4 border-b border-[#7ED957]/10">
            <h2 className="text-2xl font-bold text-white">Active Complaints</h2>
            <p className="text-sm text-gray-400 mt-1">Click on actions to manage complaints</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0f0a]/50 border-b border-[#7ED957]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Citizen</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Locality</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#7ED957] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7ED957]/10">
                {filteredComplaints.map((complaint, index) => (
                  <tr 
                    key={complaint._id} 
                    className="hover:bg-[#7ED957]/5 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{complaint.complaintType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{complaint.citizenId?.name}</p>
                        <p className="text-sm text-gray-400">{complaint.citizenId?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{complaint.locality}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)} transition-all duration-200 hover:scale-105 inline-block`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowViewModal(true);
                          }}
                          className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-500/30"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowAssignModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500/30"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowEscalateModal(true);
                          }}
                          className="px-4 py-2 bg-orange-600/50 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 border border-orange-500/30"
                        >
                          Escalate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComplaints.length === 0 && (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">📭</div>
              <p className="text-gray-400 font-medium text-lg">No complaints to display</p>
              <p className="text-gray-500 text-sm mt-2">New complaints will appear here</p>
            </div>
          )}
        </div>

        {/* Advanced Dashboard Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Map */}
          <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
            <div className="px-6 py-4 border-b border-[#7ED957]/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#7ED957]" />
                Complaint Locations
              </h2>
              <p className="text-sm text-gray-400 mt-1">Interactive map showing complaint locations</p>
            </div>
            <div className="h-96">
              <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {complaints.map((complaint) => (
                  <Marker
                    key={complaint._id}
                    position={[complaint.latitude || 12.9716, complaint.longitude || 77.5946]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{complaint.complaintType}</h3>
                        <p className="text-sm">{complaint.locality}</p>
                        <p className="text-sm text-gray-600">Status: {complaint.status}</p>
                        <p className="text-sm text-gray-600">Citizen: {complaint.citizenId?.name}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Analytics Overview - Simple Summary */}
          <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20">
            <div className="px-6 py-4 border-b border-[#7ED957]/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📊 Analytics Overview
              </h2>
              <p className="text-sm text-gray-400 mt-1">Summary of all complaint categories</p>
            </div>
            <div className="p-6">
              {/* Overall Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {(() => {
                  const totalStats = Object.values(overviewStats).reduce((acc, cat) => ({
                    total: acc.total + (cat.total || 0),
                    pending: acc.pending + (cat.stats?.pending || 0),
                    assigned: acc.assigned + (cat.stats?.assigned || 0),
                    inProgress: acc.inProgress + (cat.stats?.inProgress || 0),
                    resolved: acc.resolved + (cat.stats?.resolved || 0)
                  }), { total: 0, pending: 0, assigned: 0, inProgress: 0, resolved: 0 });

                  return [
                    { label: 'Total Complaints', value: totalStats.total, color: 'bg-blue-500', icon: '📋' },
                    { label: 'Pending', value: totalStats.pending, color: 'bg-yellow-500', icon: '⏳' },
                    { label: 'In Progress', value: totalStats.inProgress, color: 'bg-purple-500', icon: '🔄' },
                    { label: 'Resolved', value: totalStats.resolved, color: 'bg-green-500', icon: '✅' }
                  ].map((item, index) => (
                    <div key={item.label} className={`${item.color} rounded-lg p-4 text-white text-center transform hover:scale-105 transition-transform`}>
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm opacity-90">{item.label}</div>
                    </div>
                  ));
                })()}
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-3">Category Breakdown</h4>
                {categories.slice(0, 6).map((category) => {
                  const catStats = overviewStats[category.id];
                  const total = catStats?.total || 0;
                  return (
                    <div key={category.id} className="flex items-center gap-3 p-3 bg-[#0a0f0a]/50 rounded-lg border border-[#7ED957]/10">
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium">{category.label}</span>
                          <span className="text-gray-400 text-xs">{total} total</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="text-yellow-400">P: {catStats?.stats?.pending || 0}</span>
                          <span className="text-blue-400">A: {catStats?.stats?.assigned || 0}</span>
                          <span className="text-purple-400">IP: {catStats?.stats?.inProgress || 0}</span>
                          <span className="text-green-400">R: {catStats?.stats?.resolved || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white placeholder-gray-400 focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-[#0a0f0a] border border-[#7ED957]/30 rounded-lg text-white focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7ED957]/20 hover:bg-[#7ED957]/30 text-[#7ED957] rounded-lg transition-colors border border-[#7ED957]/30 relative"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0f140f] border border-[#7ED957]/30 rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-[#7ED957]/10">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification, index) => (
                          <div key={index} className="p-4 border-b border-[#7ED957]/10 hover:bg-[#7ED957]/5">
                            <p className="text-white text-sm">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-slideUp border border-[#7ED957]/20">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl border-b border-blue-500/30">
                <h2 className="text-2xl font-bold text-white">Assign to Team</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded backdrop-blur-xl">
                  <p className="text-sm text-gray-400 font-medium">Complaint Type</p>
                  <p className="text-white font-semibold">{selectedComplaint.complaintType}</p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">
                    Select Team <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={actionData.teamId}
                    onChange={(e) => setActionData({ ...actionData, teamId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                  >
                    <option value="">Choose a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.teamName} - {team.availabilityStatus}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={actionData.remarks}
                    onChange={(e) => setActionData({ ...actionData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none resize-none"
                    placeholder="Add any remarks or special instructions..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAssignTeam}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/30"
                  >
                    Assign Team
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
                    }}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transform transition-all duration-200 hover:scale-105 border border-gray-600/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escalate Modal */}
        {showEscalateModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-slideUp border border-[#7ED957]/20">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 rounded-t-2xl border-b border-orange-500/30">
                <h2 className="text-2xl font-bold text-white">Escalate to Ward Office</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded backdrop-blur-xl">
                  <p className="text-sm text-gray-400 font-medium">Complaint Type</p>
                  <p className="text-white font-semibold">{selectedComplaint.complaintType}</p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">
                    Select Ward Office <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={actionData.wardOfficeId}
                    onChange={(e) =>
                      setActionData({ ...actionData, wardOfficeId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none"
                  >
                    <option value="">Choose a ward office</option>
                    {wardOffices.map((ward) => (
                      <option key={ward._id} value={ward._id}>
                        {ward.wardNumber} - {ward.officeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-2">
                    Escalation Reason
                  </label>
                  <textarea
                    value={actionData.remarks}
                    onChange={(e) => setActionData({ ...actionData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none resize-none"
                    placeholder="Explain why this complaint needs escalation..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEscalate}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-orange-500/30"
                  >
                    Escalate Now
                  </button>
                  <button
                    onClick={() => {
                      setShowEscalateModal(false);
                      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
                    }}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transform transition-all duration-200 hover:scale-105 border border-gray-600/30"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp border border-[#7ED957]/20">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center border-b border-gray-700/30">
                <h2 className="text-2xl font-bold text-white">Complaint Details</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedComplaint.complaintType}</h3>
                    <span className="text-sm text-gray-500">ID: {selectedComplaint._id}</span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>

                {/* Image Section */}
                {selectedComplaint.imageUrl && (
                  <div className="w-full h-64 bg-[#0a0f0a] rounded-xl overflow-hidden border border-[#7ED957]/20">
                    <img 
                      src={selectedComplaint.imageUrl} 
                      alt="Complaint Evidence" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="bg-[#0a0f0a]/50 p-4 rounded-xl border border-[#7ED957]/10 backdrop-blur-xl">
                  <h4 className="text-sm font-bold text-[#7ED957] uppercase mb-2">Description</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedComplaint.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#7ED957] uppercase mb-2">Location Details</h4>
                    <div className="bg-blue-500/10 p-4 rounded-xl space-y-2 border border-blue-500/20 backdrop-blur-xl">
                      <p className="text-gray-300"><span className="font-semibold text-white">Locality:</span> {selectedComplaint.locality}</p>
                      <p className="text-gray-300"><span className="font-semibold text-white">Address:</span> {selectedComplaint.address}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#7ED957] uppercase mb-2">Citizen Details</h4>
                    <div className="bg-purple-500/10 p-4 rounded-xl space-y-2 border border-purple-500/20 backdrop-blur-xl">
                      <p className="text-gray-300"><span className="font-semibold text-white">Name:</span> {selectedComplaint.citizenId?.name}</p>
                      <p className="text-gray-300"><span className="font-semibold text-white">Phone:</span> {selectedComplaint.citizenId?.phone}</p>
                      <p className="text-gray-300"><span className="font-semibold text-white">Email:</span> {selectedComplaint.citizenId?.email}</p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline/Dates */}
                 <div className="text-sm text-gray-500 pt-4 border-t border-[#7ED957]/10">
                    <p>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                    {selectedComplaint.resolvedAt && (
                        <p className="text-green-400">Resolved: {new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                    )}
                 </div>

              </div>
              
              <div className="bg-[#0a0f0a]/50 px-6 py-4 rounded-b-2xl flex justify-end border-t border-[#7ED957]/10">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors border border-gray-700/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};