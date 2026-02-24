import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, setupService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapPin, Download, Filter, Search, ArrowLeft, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export const DepartmentComplaints = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [wardOffices, setWardOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionData, setActionData] = useState({ teamId: '', wardOfficeId: '', remarks: '' });
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);

  const categories = {
    WASTE_MANAGEMENT: { label: 'Waste Management', icon: '🗑️' },
    POTHOLES: { label: 'Potholes / Road', icon: '🛣️' },
    ELECTRICITY: { label: 'Electricity', icon: '⚡' },
    WATER: { label: 'Water Supply', icon: '💧' },
    SANITATION: { label: 'Sanitation', icon: '🚽' },
    PUBLIC_PROPERTY: { label: 'Public Property', icon: '🏢' },
    E_WASTE: { label: 'E-Waste', icon: '♻️' },
    SECURITY: { label: 'Security', icon: '🛡️' },
    HEALTH: { label: 'Health & Hygiene', icon: '🏥' },
    ENVIRONMENT: { label: 'Environment', icon: '🌱' },
    TRANSPORT: { label: 'Transport', icon: '🚗' },
    EDUCATION: { label: 'Education', icon: '📚' },
  };

  const category = categories[categoryId];

  useEffect(() => {
    if (!category) {
      navigate('/admin-dashboard');
      return;
    }
    document.title = `Admin - ${category.label} Department | CivicCare`;
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintRes, teamsRes, wardRes] = await Promise.all([
        adminService.getDepartmentComplaints(categoryId),
        setupService.getTeamsByCategory(categoryId),
        setupService.getAllWardOffices()
      ]);

      setComplaints(complaintRes.data.complaints);
      setStats(complaintRes.data.stats);
      setTeams(teamsRes.data.teams);
      setWardOffices(wardRes.data.wardOffices);
    } catch (err) {
      setError('Failed to load department data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = (complaint.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (complaint.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssignTeam = async () => {
    if (!actionData.teamId) {
      alert('Please select a team');
      return;
    }
    try {
      await adminService.assignTeam({ complaintId: selectedComplaint._id, teamId: actionData.teamId, remarks: actionData.remarks });
      setShowAssignModal(false);
      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  const handleEscalate = async () => {
    if (!actionData.wardOfficeId) {
      alert('Please select a ward office');
      return;
    }
    try {
      await adminService.escalateComplaint({ complaintId: selectedComplaint._id, wardOfficeId: actionData.wardOfficeId, remarks: actionData.remarks });
      setShowEscalateModal(false);
      setActionData({ teamId: '', wardOfficeId: '', remarks: '' });
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to escalate complaint:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ASSIGNED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'RESOLVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const exportData = () => {
    const csvData = filteredComplaints.map(c => ({
      ID: c.id,
      Title: c.title,
      Status: c.status,
      Created: new Date(c.createdAt).toLocaleDateString(),
      Location: c.location,
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
    a.download = `${categoryId}-complaints.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Department Complaints...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Department not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            {category.label} Department
          </h1>
          <p className="text-gray-400">Manage complaints for {category.label.toLowerCase()}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Complaints</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-purple-400">{stats?.inProgress || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats?.resolved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold">{category.label} Complaints ({filteredComplaints.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Citizen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredComplaints.slice(0, 50).map((complaint) => (
                  <tr key={complaint._id || complaint.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{complaint.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{complaint.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {complaint.citizenId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowViewModal(true);
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowEscalateModal(true);
                          }}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded text-xs"
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
          {filteredComplaints.length > 50 && (
            <div className="p-4 text-center text-gray-400">
              Showing first 50 results. Use filters to narrow down.
            </div>
          )}
        </div>

        {/* Modals */}
        {showViewModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between items-center border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Complaint Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedComplaint.title}</h3>
                    <span className="text-sm text-gray-500">ID: {selectedComplaint.id}</span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="bg-gray-700 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-green-400 uppercase mb-2">Description</h4>
                  <p className="text-gray-300">{selectedComplaint.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-green-400 uppercase mb-2">Location</h4>
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                      <p className="text-gray-300">Locality: {selectedComplaint.locality}</p>
                      <p className="text-gray-300">Address: {selectedComplaint.address}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-green-400 uppercase mb-2">Citizen</h4>
                    <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                      <p className="text-gray-300">Name: {selectedComplaint.citizenId?.name}</p>
                      <p className="text-gray-300">Phone: {selectedComplaint.citizenId?.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 pt-4 border-t border-gray-700">
                  <p>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-gray-700 px-6 py-4 rounded-b-2xl flex justify-end border-t border-gray-600">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showAssignModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-blue-600 px-6 py-4 rounded-t-2xl border-b border-blue-500/30">
                <h2 className="text-2xl font-bold text-white">Assign Team</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-400">Complaint: {selectedComplaint.title}</p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-2">Select Team</label>
                  <select
                    value={actionData.teamId}
                    onChange={(e) => setActionData({ ...actionData, teamId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl focus:border-blue-500"
                  >
                    <option value="">Choose a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.teamName} ({team.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-2">Remarks</label>
                  <textarea
                    value={actionData.remarks}
                    onChange={(e) => setActionData({ ...actionData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl focus:border-blue-500 resize-none"
                    placeholder="Optional remarks..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAssignTeam}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Assign Team
                  </button>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEscalateModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-orange-600 px-6 py-4 rounded-t-2xl border-b border-orange-500/30">
                <h2 className="text-2xl font-bold text-white">Escalate to Ward Office</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded">
                  <p className="text-sm text-gray-400">Complaint: {selectedComplaint.title}</p>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-2">Select Ward Office</label>
                  <select
                    value={actionData.wardOfficeId}
                    onChange={(e) => setActionData({ ...actionData, wardOfficeId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl focus:border-orange-500"
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
                  <label className="block font-semibold text-gray-300 mb-2">Escalation Reason</label>
                  <textarea
                    value={actionData.remarks}
                    onChange={(e) => setActionData({ ...actionData, remarks: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl focus:border-orange-500 resize-none"
                    placeholder="Explain why this needs escalation..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEscalate}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};