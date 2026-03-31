import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export const RaiseComplaintPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    complaintType: '',
    description: '',
    locality: '',
    address: '',
    imageUrl: '',
    location: null,
  });

  const categories = [
    { value: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: '🗑️' },
    { value: 'POTHOLES', label: 'Potholes / Road Damage', icon: '🚗' },
    { value: 'ELECTRICITY', label: 'Electricity Problems', icon: '⚡' },
    { value: 'PUBLIC_PROPERTY', label: 'Vandalised Public Property', icon: '🏗️' },
    { value: 'E_WASTE', label: 'E-Waste Management', icon: '📱' },
    { value: 'SECURITY', label: 'Security & Threat Awareness', icon: '🔒' },
    { value: 'HEALTH', label: 'Health & Sanitation', icon: '🏥' },
    { value: 'ENVIRONMENT', label: 'Environmental Issues', icon: '🌿' },
    { value: 'TRANSPORT', label: 'Public Transport', icon: '🚌' },
    { value: 'EDUCATION', label: 'Education Facilities', icon: '📚' },
  ];

  const complaintTypes = {
    WASTE_MANAGEMENT: ['Garbage Overflow', 'Missed Pickup', 'Illegal Dumping'],
    POTHOLES: ['Large Pothole', 'Damaged Road', 'Broken Pavement'],
    ELECTRICITY: ['Streetlight Not Working', 'Power Fault', 'Electrical Hazard'],
    PUBLIC_PROPERTY: ['Damaged Bench', 'Broken Toilet', 'Vandalised Signage'],
    E_WASTE: ['E-Waste Pickup Request', 'Improper Disposal'],
    SECURITY: ['Suspicious Activity', 'Unsafe Condition', 'Street Crime'],
    HEALTH: ['Medical Waste', 'Sanitation Issue', 'Health Hazard'],
    ENVIRONMENT: ['Air Pollution', 'Water Pollution', 'Noise Pollution'],
    TRANSPORT: ['Bus Delay', 'Traffic Signal Issue', 'Parking Problem'],
    EDUCATION: ['School Maintenance', 'Teacher Shortage', 'Facility Issue'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('');
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        }));
        setLocationMessage(`Current coordinates captured: ${latitude}, ${longitude}`);
        setLocationLoading(false);
      },
      (geoError) => {
        const messageByCode = {
          1: 'Location permission was denied. Please allow location access and try again.',
          2: 'Unable to detect your location right now. Please try again.',
          3: 'Location request timed out. Please try again.',
        };

        setError(messageByCode[geoError.code] || 'Failed to capture your current location.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await complaintService.createComplaint(formData);
      setFormData({
        title: '',
        category: '',
        complaintType: '',
        description: '',
        locality: '',
        address: '',
        imageUrl: '',
        location: null,
      });
      setLocationMessage('');
      alert('Complaint submitted successfully!');
      navigate('/my-complaints');
    } catch (err) {
      if (err.response?.status === 413) {
        setError('Image is too large. Please upload a smaller image (under 50MB).');
      } else {
        setError(err.response?.data?.message || 'Failed to submit complaint');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Raise a </span>
            <span className="text-[#7ED957]">Complaint</span>
          </h1>
          <p className="text-gray-400">Help us improve our city by reporting issues</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-xl animate-shake">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {locationMessage && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 102 0V7zm-1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{locationMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-xl p-8 space-y-6 border border-[#7ED957]/20">
          {/* Category Selection */}
          <div>
            <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Complaint Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Complaint Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-500"
              placeholder="Brief title for your complaint"
              required
            />
          </div>

          {/* Complaint Type */}
          {formData.category && (
            <div className="animate-fadeIn">
              <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Complaint Type *
              </label>
              <select
                name="complaintType"
                value={formData.complaintType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200"
                required
              >
                <option value="">Select a type</option>
                {complaintTypes[formData.category]?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 resize-none placeholder-gray-500"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Locality *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-500"
                placeholder="e.g., Downtown"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-500"
                placeholder="Street address"
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#7ED957]/20 bg-[#0a0f0a]/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-white font-semibold">Pin Exact Location</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Capture your current GPS location so supervisors can map this complaint accurately.
                </p>
              </div>
              <button
                type="button"
                onClick={captureCurrentLocation}
                disabled={locationLoading}
                className="px-4 py-2 rounded-lg bg-[#7ED957] text-[#0a0f0a] font-semibold hover:bg-[#9EF76E] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {locationLoading ? 'Capturing...' : 'Use Current Location'}
              </button>
            </div>

            {formData.location?.coordinates && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#111611] border border-[#7ED957]/15 px-3 py-2">
                  <span className="text-gray-400">Latitude:</span>{' '}
                  <span className="text-white">{formData.location.coordinates[1]}</span>
                </div>
                <div className="rounded-lg bg-[#111611] border border-[#7ED957]/15 px-3 py-2">
                  <span className="text-gray-400">Longitude:</span>{' '}
                  <span className="text-white">{formData.location.coordinates[0]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Upload Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-gray-400 rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7ED957] file:text-[#0a0f0a] hover:file:bg-[#9EF76E] file:cursor-pointer"
              />
            </div>
            {formData.imageUrl && (
              <div className="mt-4 relative group">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="max-h-64 w-full object-contain rounded-xl border-2 border-[#7ED957]/20"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] py-4 rounded-xl font-bold text-lg hover:from-[#9EF76E] hover:to-[#7ED957] disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 transition-all duration-300 shadow-lg hover:shadow-[#7ED957]/30 hover:scale-105 transform disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0a0f0a] border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
