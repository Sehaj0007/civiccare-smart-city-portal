import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import {
  onComplaintStatusUpdate,
  offComplaintStatusUpdate,
} from '../services/socketService';

export const MyComplaintsPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }
    
    fetchComplaints();

    // Listen to real-time updates
    onComplaintStatusUpdate((updatedComplaint) => {
      setComplaints((prev) =>
        prev.map((c) => (c._id === updatedComplaint._id ? updatedComplaint : c))
      );
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Complaint ${updatedComplaint._id} status updated to ${updatedComplaint.status}`,
        },
      ]);
    });

    return () => {
      offComplaintStatusUpdate();
    };
  }, [user?._id]);

  const fetchComplaints = async () => {
    if (!user || !user._id) {
      setLoading(false);
      setError('User not authenticated. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;

      const response = await complaintService.getUserComplaints(user._id, params);
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
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
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7ED957] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium text-lg">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (!user || !user._id) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your complaints</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] rounded-xl font-bold hover:from-[#9EF76E] hover:to-[#7ED957] transition-all duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">My </span>
              <span className="text-[#7ED957]">Complaints</span>
            </h1>
            <p className="text-gray-400">Track and manage your submitted complaints</p>
          </div>
          <Link
            to="/raise-complaint"
            className="group relative px-6 py-3 bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] rounded-xl font-bold hover:from-[#9EF76E] hover:to-[#7ED957] transition-all duration-300 shadow-lg hover:shadow-[#7ED957]/30 hover:scale-105 transform flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Raise New Complaint
          </Link>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 backdrop-blur-xl animate-slideDown">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center gap-3 text-green-400">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{notif.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-6 mb-6 border border-[#7ED957]/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#7ED957]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Complaints
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2">Category</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200"
              >
                <option value="">All Categories</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="POTHOLES">Potholes</option>
                <option value="ELECTRICITY">Electricity</option>
                <option value="PUBLIC_PROPERTY">Public Property</option>
                <option value="E_WASTE">E-Waste</option>
                <option value="SECURITY">Security</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchComplaints}
            className="mt-4 px-6 py-3 bg-[#7ED957] hover:bg-[#9EF76E] text-[#0a0f0a] rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-[#7ED957]/30 hover:scale-105 transform flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Apply Filters
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-xl animate-shake">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Empty State */}
        {complaints.length === 0 ? (
          <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] border-2 border-[#7ED957]/20 border-dashed rounded-2xl p-12 text-center">
            <div className="text-7xl mb-4">📭</div>
            <p className="text-gray-400 text-xl font-medium mb-6">No complaints found</p>
            <Link
              to="/raise-complaint"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] rounded-xl font-bold hover:from-[#9EF76E] hover:to-[#7ED957] transition-all duration-300 shadow-lg hover:shadow-[#7ED957]/30 hover:scale-105 transform"
            >
              Raise Your First Complaint
            </Link>
          </div>
        ) : (
          /* Complaints List */
          <div className="space-y-4">
            {complaints.map((complaint, index) => (
              <Link
                key={complaint._id}
                to={`/complaint/${complaint._id}`}
                className="block bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-lg p-6 border border-[#7ED957]/20 hover:border-[#7ED957]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#7ED957]/10 hover:scale-102 transform group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="mt-1">
                        <svg className="w-6 h-6 text-[#7ED957]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#7ED957] transition-colors duration-300">
                          {complaint.complaintType}
                        </h3>
                        <p className="text-gray-400 text-sm">{complaint.category.replace(/_/g, ' ')}</p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-full font-bold text-sm border whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>

                <p className="text-gray-300 mt-4 line-clamp-2">
                  {complaint.description.substring(0, 150)}
                  {complaint.description.length > 150 && '...'}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#7ED957]/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {complaint.locality}
                  </div>
                  
                  {complaint.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {complaint.rating}/5
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-2 text-[#7ED957] text-sm font-medium group-hover:gap-3 transition-all">
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx="true">{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};