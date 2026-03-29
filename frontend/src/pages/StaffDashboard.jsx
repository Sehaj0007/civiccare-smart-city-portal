import React, { useContext, useEffect, useState } from 'react';
import { staffService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, CheckCircle, Clock, FolderKanban, Users } from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [department, setDepartment] = useState('');

  const fetchDashboard = async (teamId) => {
    try {
      setLoading(true);
      const response = await staffService.getDashboard(teamId ? { teamId } : {});
      setDepartment(response.data.department);
      setTeams(response.data.teams || []);
      setSelectedTeam(response.data.selectedTeam?._id || '');
      setStats(response.data.stats);
      setComplaints(response.data.complaints || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load staff dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusUpdate = async (complaintId, status) => {
    try {
      await staffService.updateComplaintStatus(complaintId, { status });
      await fetchDashboard(selectedTeam);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update complaint status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center pt-24">
        <div className="text-white text-xl">Loading staff dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Staff </span>
            <span className="text-[#7ED957]">Dashboard</span>
          </h1>
          <p className="text-gray-400">
            Signed in as {user?.name}. Choose a team from your department to view its assigned work.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-[#7ED957]/20 bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] p-6">
          <h2 className="text-2xl font-bold text-white">{department?.replace(/_/g, ' ')} Staff Console</h2>
          <p className="text-gray-400 mt-2">Department login: {user?.email}</p>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Team Menu</label>
            <div className="flex flex-wrap gap-3">
              {teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => fetchDashboard(team._id)}
                  className={`rounded-xl px-5 py-3 border font-semibold transition-all ${
                    selectedTeam === team._id
                      ? 'bg-[#7ED957] text-[#0a0f0a] border-[#7ED957]'
                      : 'bg-[#0a0f0a] text-white border-[#7ED957]/30 hover:border-[#7ED957] hover:bg-[#7ED957]/10'
                  }`}
                >
                  {team.teamName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedTeam && teams.length > 0 && (
          <div className="mb-6 rounded-2xl border border-[#7ED957]/20 bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] p-6">
            <h2 className="text-2xl font-bold text-white">{teams.find((team) => team._id === selectedTeam)?.teamName}</h2>
            <p className="text-gray-400 mt-2">Department: {teams.find((team) => team._id === selectedTeam)?.departmentCategory?.replace(/_/g, ' ')}</p>
            <p className="text-gray-400">Team Contact: {teams.find((team) => team._id === selectedTeam)?.contactNumber || 'Not configured'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f140f] border border-[#7ED957]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Assigned</p>
                <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
              </div>
              <FolderKanban className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-[#0f140f] border border-[#7ED957]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Assigned</p>
                <p className="text-2xl font-bold mt-1 text-yellow-400">{stats?.assigned || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-[#0f140f] border border-[#7ED957]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold mt-1 text-purple-400">{stats?.inProgress || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-[#0f140f] border border-[#7ED957]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{stats?.resolved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#7ED957]/20 bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#7ED957]/10">
            <div>
              <h3 className="text-xl font-semibold">Assigned Complaints</h3>
              <p className="text-sm text-gray-400">Only complaints assigned to the selected team are listed here.</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          {complaints.length === 0 ? (
            <div className="p-6 text-gray-400">No complaints are assigned to your team yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0f0a]/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Citizen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Locality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7ED957]/10">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-[#7ED957]/5">
                      <td className="px-6 py-4 text-sm text-white">{complaint.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{complaint.status}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{complaint.citizenId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{complaint.locality}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(complaint._id, 'IN_PROGRESS')}
                            className="rounded-md bg-purple-500/20 px-3 py-1 text-purple-300"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(complaint._id, 'RESOLVED')}
                            className="rounded-md bg-green-500/20 px-3 py-1 text-green-300"
                          >
                            Complete
                          </button>
                        </div>
                      </td>
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
