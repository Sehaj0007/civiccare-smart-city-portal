import React, { useState, useEffect, useContext } from 'react';
import { complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Download, Filter, Search, Calendar } from 'lucide-react';

export const Supervisor = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  const categories = [
    { id: 'WASTE_MANAGEMENT', label: 'Waste Management' },
    { id: 'POTHOLES', label: 'Potholes / Road' },
    { id: 'ELECTRICITY', label: 'Electricity' },
    { id: 'WATER', label: 'Water Supply' },
    { id: 'SANITATION', label: 'Sanitation' },
    { id: 'PUBLIC_PROPERTY', label: 'Public Property' },
    { id: 'E_WASTE', label: 'E-Waste' },
    { id: 'SECURITY', label: 'Security' },
    { id: 'HEALTH', label: 'Health & Hygiene' },
    { id: 'ENVIRONMENT', label: 'Environment' },
    { id: 'TRANSPORT', label: 'Transport' },
    { id: 'EDUCATION', label: 'Education' },
  ];

  const statusColors = {
    PENDING: '#fbbf24',
    ASSIGNED: '#3b82f6',
    IN_PROGRESS: '#f59e0b',
    RESOLVED: '#10b981',
    CLOSED: '#6b7280'
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch all complaints
      const complaintsRes = await complaintService.getAllComplaints();
      setComplaints(complaintsRes.data.complaints);

      // Fetch overview stats
      const statsRes = await complaintService.getStats();
      setStats(statsRes.data);

      // Generate analytics data
      generateAnalyticsData(complaintsRes.data.complaints);
      generateMonthlyTrends(complaintsRes.data.complaints);
      generateDepartmentStats(complaintsRes.data.complaints, statsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsData = (complaints) => {
    const statusCounts = complaints.reduce((acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: statusColors[status] || '#6b7280'
    }));

    setAnalyticsData(data);
  };

  const generateMonthlyTrends = (complaints) => {
    const monthlyData = {};
    complaints.forEach(complaint => {
      const date = new Date(complaint.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, total: 0, resolved: 0 };
      }
      monthlyData[monthKey].total++;
      if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
        monthlyData[monthKey].resolved++;
      }
    });

    const sortedData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    setMonthlyTrends(sortedData);
  };

  const generateDepartmentStats = (complaints, stats) => {
    if (stats?.complaintsByCategory) {
      const data = stats.complaintsByCategory.map(cat => ({
        department: cat._id,
        total: cat.count,
        resolved: 0, // We'll calculate this from complaints
        pending: 0
      }));

      // Calculate resolved and pending from complaints
      complaints.forEach(complaint => {
        const dept = data.find(d => d.department === complaint.category);
        if (dept) {
          if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
            dept.resolved++;
          } else {
            dept.pending++;
          }
        }
      });

      setDepartmentStats(data);
    } else {
      const deptData = {};
      complaints.forEach(complaint => {
        if (!deptData[complaint.category]) {
          deptData[complaint.category] = { department: complaint.category, total: 0, resolved: 0, pending: 0 };
        }
        deptData[complaint.category].total++;
        if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
          deptData[complaint.category].resolved++;
        } else {
          deptData[complaint.category].pending++;
        }
      });

      const data = Object.values(deptData);
      setDepartmentStats(data);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = (complaint.complaintType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (complaint.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter;
    const matchesDepartment = departmentFilter === 'ALL' || complaint.category === departmentFilter;
    const matchesDate = dateFilter === 'ALL' || checkDateFilter(complaint.createdAt, dateFilter);

    return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
  });

  const checkDateFilter = (createdAt, filter) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (filter) {
      case 'TODAY': return diffDays <= 1;
      case 'WEEK': return diffDays <= 7;
      case 'MONTH': return diffDays <= 30;
      default: return true;
    }
  };

  const exportData = () => {
    const csvData = filteredComplaints.map(c => ({
      ID: c._id?.slice(-6) || c.id,
      Type: c.complaintType,
      Status: c.status,
      Created: new Date(c.createdAt).toLocaleDateString(),
      Location: c.locality || c.address,
      Citizen: c.citizenId?.name || 'N/A'
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supervisor-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || user?.role !== 'SUPERVISOR') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access denied. Please login as supervisor.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
          <p className="text-gray-400">Monitor and analyze all civic complaints</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Complaints</p>
                <p className="text-2xl font-bold">{stats?.totalComplaints || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats?.resolvedComplaints || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.pendingComplaints || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolution Rate</p>
                <p className="text-2xl font-bold text-purple-400">
                  {stats?.totalComplaints ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Complaint Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Complaint Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">Department-wise Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="department" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold">All Complaints ({filteredComplaints.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredComplaints.slice(0, 50).map((complaint) => (
                  <tr key={complaint._id || complaint.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{complaint._id?.slice(-6) || complaint.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{complaint.complaintType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        complaint.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                        complaint.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.locality || complaint.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredComplaints.length > 50 && (
            <div className="p-4 text-center text-gray-400">
              Showing first 50 results. Use filters to narrow down.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
