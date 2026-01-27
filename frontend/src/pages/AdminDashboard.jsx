import React, { useState, useEffect, useContext } from 'react';
import { adminService, setupService, complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { joinAdminChannel, onNewComplaint, offNewComplaint } from '../services/socketService';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [wardOffices, setWardOffices] = useState([]);
  const [actionData, setActionData] = useState({ teamId: '', wardOfficeId: '', remarks: '' });

  const departmentCategoryMap = {
    WASTE_MANAGEMENT: 'WASTE_MANAGEMENT',
    ROAD_MAINTENANCE: 'POTHOLES',
    ELECTRICITY: 'ELECTRICITY',
    PUBLIC_PROPERTY: 'PUBLIC_PROPERTY',
    E_WASTE: 'E_WASTE',
    SECURITY: 'SECURITY',
  };

  const categoryLabel = {
    WASTE_MANAGEMENT: 'Waste Management',
    POTHOLES: 'Potholes / Road',
    ELECTRICITY: 'Electricity',
    PUBLIC_PROPERTY: 'Public Property',
    E_WASTE: 'E-Waste',
    SECURITY: 'Security',
  };

  useEffect(() => {
    fetchDashboardData();

    // Join admin channel for real-time updates
    if (user?.department) {
      joinAdminChannel(departmentCategoryMap[user.department]);
      onNewComplaint((newComplaint) => {
        if (newComplaint.category === departmentCategoryMap[user.department]) {
          setComplaints((prev) => [newComplaint, ...prev]);
        }
      });
    }

    return () => {
      offNewComplaint();
    };
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const category = departmentCategoryMap[user?.department];

      // Fetch complaints for department
      const complaintRes = await adminService.getDepartmentComplaints(category);
      setComplaints(complaintRes.data.complaints);
      setStats(complaintRes.data.stats);

      // Fetch teams and ward offices
      const teamsRes = await setupService.getTeamsByCategory(user?.department);
      const wardRes = await setupService.getAllWardOffices();

      setTeams(teamsRes.data.teams);
      setWardOffices(wardRes.data.wardOffices);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 border border-[#7ED957]/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7ED957]/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">{categoryLabel[departmentCategoryMap[user?.department]]}</span>
                <span className="text-[#7ED957]"> Department</span>
              </h1>
              <p className="text-gray-400">Manage and track complaints efficiently</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] px-6 py-3 rounded-xl shadow-lg font-bold">
                <p className="text-sm">Admin Dashboard</p>
              </div>
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
                {complaints.map((complaint, index) => (
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

          {complaints.length === 0 && (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">📭</div>
              <p className="text-gray-400 font-medium text-lg">No complaints to display</p>
              <p className="text-gray-500 text-sm mt-2">New complaints will appear here</p>
            </div>
          )}
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

      <style jsx>{`
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