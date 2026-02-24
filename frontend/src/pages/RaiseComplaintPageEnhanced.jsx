import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { fetchWeatherApi } from 'openmeteo';
import { complaintService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertCircle, MapPin, Upload, Zap, Brain } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat],
      });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
};

export const RaiseComplaintPageEnhanced = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    complaintType: '',
    description: '',
    locality: '',
    address: '',
    city: '',
    location: null,
    images: [],
  });
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Bangalore
  const [aiDetection, setAiDetection] = useState({
    detectedCategory: null,
    detectedPriority: null,
    similarComplaints: [],
    isDuplicate: false,
  });
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const categories = [
    { id: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: '🗑️' },
    { id: 'POTHOLES', label: 'Potholes / Road', icon: '🛣️' },
    { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡' },
    { id: 'WATER', label: 'Water Supply', icon: '💧' },
    { id: 'SANITATION', label: 'Sanitation', icon: '🚽' },
    { id: 'PUBLIC_PROPERTY', label: 'Public Property', icon: '🏢' },
    { id: 'E_WASTE', label: 'E-Waste', icon: '♻️' },
    { id: 'SECURITY', label: 'Security', icon: '🛡️' },
    { id: 'HEALTH', label: 'Health & Hygiene', icon: '🏥' },
    { id: 'ENVIRONMENT', label: 'Environment', icon: '🌱' },
    { id: 'TRANSPORT', label: 'Transport', icon: '🚗' },
    { id: 'EDUCATION', label: 'Education', icon: '📚' },
  ];

  // Detect category and priority as user types
  useEffect(() => {
    if (formData.description.length > 20) {
      detectAI();
    }
  }, [formData.description]);

  const detectAI = async () => {
    // This will call backend AI detection
    // For now, we'll implement client-side detection
    const description = formData.description.toLowerCase();

    const categoryKeywords = {
      WASTE_MANAGEMENT: ['waste', 'garbage', 'trash', 'dump'],
      POTHOLES: ['pothole', 'road', 'pavement'],
      ELECTRICITY: ['electricity', 'power', 'light', 'blackout'],
      WATER: ['water', 'pipeline', 'leak'],
      SANITATION: ['sanitation', 'sewage', 'drain'],
      SECURITY: ['security', 'crime', 'theft'],
    };

    let detected = null;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => description.includes(kw))) {
        detected = category;
        break;
      }
    }

    const priorityKeywords = {
      URGENT: ['urgent', 'emergency', 'critical', 'danger'],
      HIGH: ['severe', 'dangerous', 'risk', 'flooding'],
      MEDIUM: ['immediate', 'issue', 'problem'],
      LOW: ['minor', 'small'],
    };

    let priority = 'MEDIUM';
    for (const [level, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some(kw => description.includes(kw))) {
        priority = level;
        break;
      }
    }

    setAiDetection(prev => ({
      ...prev,
      detectedCategory: detected,
      detectedPriority: priority,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload to S3/cloud storage
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location,
    }));
    setShowLocationMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (duplicateWarning) {
        const confirmed = window.confirm('This might be a duplicate complaint. Do you want to continue?');
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      const response = await complaintService.createComplaint({
        ...formData,
        city: formData.city || 'Bangalore',
      });

      toast.success(`Complaint registered! Tracking ID: ${response.data.metadata.trackingId}`);
      navigate('/my-complaints');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to raise complaint');
    } finally {
      setLoading(false);
    }
  };

  const acceptAIDetection = () => {
    if (aiDetection.detectedCategory) {
      setFormData(prev => ({
        ...prev,
        complaintType: aiDetection.detectedCategory,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Raise a Complaint</h1>
            <p className="text-gray-600">Help us improve our city by reporting civic issues</p>
          </div>

          {/* AI Detection Alert */}
          {aiDetection.detectedCategory && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Detection</h3>
                  <p className="text-blue-800 mb-3">
                    Based on your description, we detected:
                  </p>
                  <div className="flex gap-3">
                    <div className="bg-white p-3 rounded border border-blue-200 flex-1">
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold text-gray-900">{aiDetection.detectedCategory}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200 flex-1">
                      <p className="text-sm text-gray-600">Priority</p>
                      <p className="font-semibold text-gray-900">{aiDetection.detectedPriority}</p>
                    </div>
                    <button
                      onClick={acceptAIDetection}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900">Similar Complaint Found</h3>
                <p className="text-yellow-800 text-sm mt-1">
                  We found similar complaints in this area. Review them before submitting.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Complaint Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, complaintType: cat.id }))}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.complaintType === cat.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Our AI will analyze your description to auto-detect category and priority
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </label>
              <button
                type="button"
                onClick={() => setShowLocationMap(!showLocationMap)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50"
              >
                {formData.location
                  ? `Location selected (${formData.location.coordinates[1].toFixed(4)}, ${formData.location.coordinates[0].toFixed(4)})`
                  : 'Click to select location on map'}
              </button>

              {showLocationMap && (
                <div className="mt-4 rounded-lg overflow-hidden h-80 border border-gray-300">
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker onLocationSelect={handleLocationSelect} />
                  </MapContainer>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Locality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locality / Ward *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleInputChange}
                placeholder="e.g., Indiranagar, Koramangala"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
              {formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`preview-${idx}`} className="h-24 w-24 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-complaints')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
