import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ rating: 0, feedback: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await complaintService.getComplaintById(id);
        setComplaint(response.data.complaint);
      } catch (err) {
        setError('Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      await complaintService.addFeedback(id, feedback);
      alert('Feedback submitted successfully!');
      setFeedback({ rating: 0, feedback: '' });
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#7ED957] border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-medium text-lg">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] p-6 pt-20">
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded-lg backdrop-blur-xl animate-fadeIn max-w-md">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] pt-20">
        <div className="text-center">
          <div className="text-7xl mb-4">🔍</div>
          <p className="text-gray-400 font-medium text-xl">Complaint not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white py-8 pt-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-complaints')}
          className="mb-6 flex items-center gap-2 text-[#7ED957] hover:text-[#9EF76E] font-semibold transition-all duration-200 hover:gap-3 group"
        >
          <svg className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Complaints
        </button>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl overflow-hidden border border-[#7ED957]/20 transform transition-all duration-300 hover:shadow-2xl hover:shadow-[#7ED957]/10 animate-fadeIn">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#7ED957] to-[#9EF76E] px-6 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#0a0f0a] mb-2">{complaint.complaintType}</h1>
                <p className="text-[#0a0f0a]/70 text-sm font-medium">ID: {complaint._id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-bold border text-sm ${getStatusColor(complaint.status)} backdrop-blur-xl shadow-lg`}>
                {complaint.status}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 backdrop-blur-xl transform transition-all duration-200 hover:scale-105 hover:bg-blue-500/15">
                <label className="text-blue-400 font-bold text-sm block mb-1">Category</label>
                <p className="text-white text-lg font-semibold">{complaint.category.replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/30 backdrop-blur-xl transform transition-all duration-200 hover:scale-105 hover:bg-purple-500/15">
                <label className="text-purple-400 font-bold text-sm block mb-1">Submitted On</label>
                <p className="text-white text-lg font-semibold">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30 backdrop-blur-xl transform transition-all duration-200 hover:scale-105 hover:bg-green-500/15">
                <label className="text-green-400 font-bold text-sm block mb-1">Locality</label>
                <p className="text-white text-lg font-semibold">{complaint.locality}</p>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/30 backdrop-blur-xl transform transition-all duration-200 hover:scale-105 hover:bg-orange-500/15">
                <label className="text-orange-400 font-bold text-sm block mb-1">Address</label>
                <p className="text-white text-lg font-semibold">{complaint.address}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#0a0f0a]/50 p-5 rounded-xl border border-[#7ED957]/20 backdrop-blur-xl">
              <label className="text-[#7ED957] font-bold text-sm block mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Description
              </label>
              <p className="text-gray-300 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Image */}
            {complaint.imageUrl && (
              <div className="bg-[#0a0f0a]/50 p-5 rounded-xl border border-[#7ED957]/20 backdrop-blur-xl">
                <label className="text-[#7ED957] font-bold text-sm block mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Attached Image
                </label>
                <img 
                  src={complaint.imageUrl} 
                  alt="Complaint" 
                  className="max-h-80 w-full object-contain rounded-lg border border-[#7ED957]/20 hover:border-[#7ED957]/40 transition-all duration-300" 
                />
              </div>
            )}

            {/* Assigned Team */}
            {complaint.assignedTeamId && (
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-5 rounded-xl border-l-4 border-blue-500 shadow-lg backdrop-blur-xl transform transition-all duration-200 hover:scale-102">
                <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Assigned Team
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong className="text-white">Team Name:</strong> {complaint.assignedTeamId.teamName}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Contact:</strong> {complaint.assignedTeamId.contactNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Forwarded Ward Office */}
            {complaint.forwardedWardOfficeId && (
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-5 rounded-xl border-l-4 border-orange-500 shadow-lg backdrop-blur-xl transform transition-all duration-200 hover:scale-102">
                <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  Forwarded To Ward Office
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong className="text-white">Ward:</strong> {complaint.forwardedWardOfficeId.wardNumber}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Office:</strong> {complaint.forwardedWardOfficeId.officeName}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Contact:</strong> {complaint.forwardedWardOfficeId.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Remarks */}
            {complaint.remarks && (
              <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 p-5 rounded-xl border-l-4 border-gray-500 shadow-lg backdrop-blur-xl">
                <h3 className="font-bold text-gray-400 mb-3 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Remarks
                </h3>
                <p className="text-gray-300 leading-relaxed">{complaint.remarks}</p>
              </div>
            )}

            {/* Feedback Form */}
            {complaint.status === 'RESOLVED' && !complaint.rating && (
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-xl border-2 border-green-500/30 shadow-lg backdrop-blur-xl">
                <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2 text-xl">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rate Your Experience
                </h3>
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  <div>
                    <label className="block text-gray-300 font-bold mb-3">Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedback({ ...feedback, rating: star })}
                          className={`text-4xl transform transition-all duration-200 hover:scale-125 ${
                            feedback.rating >= star ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-600'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-bold mb-3">Feedback</label>
                    <textarea
                      value={feedback.feedback}
                      onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 outline-none resize-none"
                      placeholder="Share your experience (optional)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedback.rating}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-50 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-green-500/30 disabled:cursor-not-allowed"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              </div>
            )}

            {/* Existing Rating */}
            {complaint.rating && (
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-5 rounded-xl border-2 border-blue-500/30 shadow-lg backdrop-blur-xl">
                <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Your Rating
                </h3>
                <p className="text-3xl mb-3">{'⭐'.repeat(complaint.rating)}</p>
                {complaint.feedback && <p className="text-gray-300 leading-relaxed">{complaint.feedback}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};