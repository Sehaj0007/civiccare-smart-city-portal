import React, { useState, useEffect, useContext } from 'react';
import { supervisorService, complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { AlertTriangle, TrendingUp, Users, Clock, FileText, Download } from 'lucide-react';

export const SupervisorDashboardEnhanced = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, overdue] = await Promise.all([
        supervisorService.getDashboard(),
        supervisorService.getOverdueAlerts(),
      ]);

      setDashboardData(dashboard.data);
      setOverdueAlerts(overdue.data.alerts || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Supervisor Dashboard...</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Supervisor Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring and analytics for civic complaint management</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Complaints</p>
                <p className="text-4xl font-bold mt-1">{stats.totalComplaints || 0}</p>
              </div>
              <Users className="h-12 w-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Resolved</p>
                <p className="text-4xl font-bold mt-1">{stats.resolvedComplaints || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-4xl font-bold mt-1">{stats.pendingComplaints || 0}</p>
              </div>
              <Clock className="h-12 w-12 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Overdue</p>
                <p className="text-4xl font-bold mt-1">{stats.overdueComplaints || 0}</p>
              </div>
              <AlertTriangle className="h-12 w-12 opacity-30" />
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400">Resolution Rate</p>
            <p className="text-3xl font-bold mt-2">{stats.resolutionRate || 0}%</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400">Avg Resolution Time</p>
            <p className="text-3xl font-bold mt-2">{stats.averageResolutionTime?.toFixed(1) || 0} hrs</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400">SLA Compliance</p>
            <p className="text-3xl font-bold mt-2">{stats.slaComplianceRate || 0}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          {['overview', 'analytics', 'alerts', 'teams'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                selectedTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trends */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Monthly Complaint Trends</h3>
                {dashboardData?.monthlyTrends && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="totalComplaints" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolvedComplaints" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category Distribution */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Complaint Distribution by Category</h3>
                {dashboardData?.categoryDistribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardData.categoryDistribution).map(([name, value]) => ({
                          name,
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(dashboardData.categoryDistribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Department Performance */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold mb-4">Department-wise Performance</h3>
              {dashboardData?.departmentBreakdown && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dashboardData.departmentBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="totalComplaints" fill="#3b82f6" name="Total" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                    <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Team Rankings */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Top Performing Teams</h3>
              <div className="space-y-3">
                {dashboardData?.teamRankings?.slice(0, 5).map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded">
                    <span className="text-xl font-bold text-yellow-400">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-xs text-gray-400">⭐ {team.overallRating.toFixed(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{team.resolved} resolved</p>
                      <p className="text-xs text-gray-400">{team.slaComplianceRate}% SLA</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Priority Distribution</h3>
              {dashboardData?.priorityDistribution && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(dashboardData.priorityDistribution).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(dashboardData.priorityDistribution).map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {selectedTab === 'alerts' && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Overdue Complaints Alert</h3>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            {overdueAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Tracking ID</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-left">Days Overdue</th>
                      <th className="px-4 py-2 text-left">Assigned Team</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {overdueAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-gray-700">
                        <td className="px-4 py-2 font-semibold">{alert.trackingId}</td>
                        <td className="px-4 py-2">{alert.category}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            alert.priority === 'URGENT' ? 'bg-red-500' :
                            alert.priority === 'HIGH' ? 'bg-orange-500' :
                            alert.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {alert.priority}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-red-400">{alert.daysOverdue} days</td>
                        <td className="px-4 py-2">{alert.assignedTeam || 'Unassigned'}</td>
                        <td className="px-4 py-2">{alert.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No overdue complaints - Great job!
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {selectedTab === 'teams' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {dashboardData?.teamRankings?.map(team => (
              <div key={team.id} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{team.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Assigned</span>
                    <span className="font-semibold">{team.totalAssigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolved</span>
                    <span className="font-semibold text-green-400">{team.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SLA Compliance</span>
                    <span className="font-semibold text-blue-400">{team.slaComplianceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Resolution</span>
                    <span className="font-semibold">{team.averageResolutionTime} hrs</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-700">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-xl font-bold text-yellow-400">⭐ {team.overallRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
