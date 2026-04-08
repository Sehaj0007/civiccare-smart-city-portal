import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { supervisorService, complaintService } from '../services/apiService';
import 'leaflet/dist/leaflet.css';

const PUNJAB_DEFAULT_CENTER = [30.9000, 75.8500];
const PUNJAB_DEFAULT_ZOOM = 8;

const PunjabMapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);

  return null;
};

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supervisor, setSupervisor] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [escalatedStats, setEscalatedStats] = useState(null);
  const [trackerSummary, setTrackerSummary] = useState(null);
  const [isHeatmapLoaded, setIsHeatmapLoaded] = useState(false);
  const defaultMapCenter = PUNJAB_DEFAULT_CENTER;

  const locationKeywordCoordinates = useMemo(() => ({
    punjab: [31.1471, 75.3412],
    chandigarh: [30.7333, 76.7794],
    amritsar: [31.6340, 74.8723],
    ludhiana: [30.9010, 75.8573],
    jalandhar: [31.3260, 75.5762],
    patiala: [30.3398, 76.3869],
    mohali: [30.7046, 76.7179],
    kharar: [30.7463, 76.6461],
    bangalore: [12.9716, 77.5946],
    bengaluru: [12.9716, 77.5946],
    indiranagar: [12.9784, 77.6408],
    koramangala: [12.9352, 77.6245],
    whitefield: [12.9698, 77.7500],
    jayanagar: [12.9250, 77.5938],
    "hsr layout": [12.9116, 77.6474],
  }), []);

  const getCoordinatesFromText = useCallback((...parts) => {
    const combined = parts.filter(Boolean).join(' ').toLowerCase();
    const match = Object.entries(locationKeywordCoordinates).find(([keyword]) => combined.includes(keyword));
    return match ? match[1] : null;
  }, [locationKeywordCoordinates]);

  const getCoordinatesForHeatmapItem = useCallback((item, index) => {
    if (Array.isArray(item?.coordinates) && item.coordinates.length >= 2) {
      return [item.coordinates[1], item.coordinates[0]];
    }

    const inferred = getCoordinatesFromText(item?.locality, item?.address, item?.city, item?.state);
    if (inferred) {
      return inferred;
    }

    return null;
  }, [getCoordinatesFromText]);

  const buildHeatmapFallbackFromComplaints = useCallback((complaints = []) => {
    const isPunjabComplaint = (complaint) => {
      const coordinates = complaint?.location?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length >= 2) {
        const [lng, lat] = coordinates;
        if (lat >= 29.5 && lat <= 32.8 && lng >= 73.8 && lng <= 77.9) {
          return true;
        }
      }

      const combinedText = [complaint?.locality, complaint?.address, complaint?.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return ['punjab', 'chandigarh', 'mohali', 'kharar', 'amritsar', 'ludhiana', 'jalandhar', 'patiala']
        .some((keyword) => combinedText.includes(keyword));
    };

    const punjabComplaints = complaints.filter(isPunjabComplaint);

    const grouped = punjabComplaints.reduce((acc, complaint) => {
      const localityName = complaint?.locality?.trim() || 'Unknown';
      if (!acc[localityName]) {
        acc[localityName] = {
          locality: localityName,
          totalComplaints: 0,
          resolvedComplaints: 0,
          pendingComplaints: 0,
          topCategories: new Set(),
          coordinates: null,
          address: complaint?.address || '',
          city: complaint?.city || '',
        };
      }

      acc[localityName].totalComplaints += 1;
      if (complaint?.status === 'RESOLVED' || complaint?.status === 'CLOSED') {
        acc[localityName].resolvedComplaints += 1;
      } else {
        acc[localityName].pendingComplaints += 1;
      }

      if (complaint?.category) {
        acc[localityName].topCategories.add(complaint.category);
      }

      if (!acc[localityName].coordinates && Array.isArray(complaint?.location?.coordinates) && complaint.location.coordinates.length >= 2) {
        acc[localityName].coordinates = complaint.location.coordinates;
      }

      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        topCategories: Array.from(item.topCategories).slice(0, 3),
      }))
      .sort((a, b) => b.totalComplaints - a.totalComplaints);
  }, []);

  const buildTrackerSummary = useCallback((complaints = []) => {
    const now = new Date();

    const summarizeWindow = (days) => {
      const windowComplaints = complaints.filter((complaint) => {
        const createdAt = complaint?.createdAt ? new Date(complaint.createdAt) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
        const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      });

      return {
        total: windowComplaints.length,
        resolved: windowComplaints.filter((complaint) => complaint.status === 'RESOLVED' || complaint.status === 'CLOSED').length,
        pending: windowComplaints.filter((complaint) => !['RESOLVED', 'CLOSED'].includes(complaint.status)).length,
      };
    };

    return {
      recent: summarizeWindow(1),
      weekly: summarizeWindow(7),
      monthly: summarizeWindow(30),
    };
  }, []);

  const mapCenter = useMemo(() => {
    const coordinates = heatmapData
      .map((item, index) => getCoordinatesForHeatmapItem(item, index))
      .filter(Boolean);

    if (coordinates.length === 0) {
      return defaultMapCenter;
    }

    const avgLat = coordinates.reduce((sum, point) => sum + point[0], 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length;
    return [avgLat, avgLng];
  }, [defaultMapCenter, getCoordinatesForHeatmapItem, heatmapData]);

  const mapZoom = heatmapData.length > 0 ? 10 : PUNJAB_DEFAULT_ZOOM;

  const loadSession = useCallback(() => {
    const supervisorData = localStorage.getItem('supervisor');
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !supervisorData || !userData) {
      navigate('/supervisor-login');
      return false;
    }

    try {
      setSupervisor(JSON.parse(supervisorData));
      setUser(JSON.parse(userData));
      return true;
    } catch {
      setError('Invalid session data. Please log in again.');
      return false;
    }
  }, [navigate]);

  const fetchRealtimeData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, escalatedRes, complaintsRes] = await Promise.all([
        supervisorService.getDashboard(),
        supervisorService.getEscalatedComplaints(10),
        complaintService.getAllComplaints({ limit: 500 }),
      ]);

      const dashboard = dashboardRes.data || {};

      setStats(dashboard.stats || null);

      const trends = (dashboard.monthlyTrends || []).map((item) => {
        const total = item.totalComplaints || 0;
        const resolved = item.resolvedComplaints || 0;
        return {
          month: item.month,
          resolved,
          pending: Math.max(total - resolved, 0),
          total,
        };
      });

      setTrendData(trends);
      const allComplaints = complaintsRes.data?.complaints || [];
      const fallbackHeatmapData = buildHeatmapFallbackFromComplaints(allComplaints);
      setHeatmapData(fallbackHeatmapData);

      setEscalatedComplaints(escalatedRes.data?.complaints || []);
      setEscalatedStats(escalatedRes.data?.stats || null);
      setTrackerSummary(buildTrackerSummary(allComplaints));

      setIsHeatmapLoaded(true);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setHeatmapData([]);
      setEscalatedComplaints([]);
      setEscalatedStats(null);
      setTrackerSummary(null);
      setIsHeatmapLoaded(true);
      setError(
        err?.response?.status === 429
          ? 'Server is busy. Please try again in a moment.'
          : err?.response?.data?.message || 'Failed to load analytics data'
      );
      setLoading(false);
    }
  }, [buildHeatmapFallbackFromComplaints, buildTrackerSummary]);

  useEffect(() => {
    const isValidSession = loadSession();
    if (!isValidSession) {
      setLoading(false);
      return;
    }

    fetchRealtimeData();
    return () => {};
  }, [fetchRealtimeData, loadSession]);

  const handleLogout = async () => {
    await logout();
    navigate('/supervisor-login');
  };

  const solved = stats?.resolvedComplaints || 0;
  const pending = (stats?.pendingComplaints || 0) + (stats?.inProgressComplaints || 0);
  const hasHeatmapPoints = heatmapData.length > 0;
  const complaintStatusData = [
    { name: 'Solved', value: solved, color: '#4ade80' },
    { name: 'Pending', value: pending, color: '#facc15' },
  ].filter((item) => item.value > 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!supervisor || !user) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center text-white pt-24">
        Invalid session. Please login again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Supervisor Analytics</h1>
            <p className="text-gray-400 mt-1">{supervisor.designation || 'Supervisor'}</p>
            <p className="text-gray-500 text-sm mt-1">
              Analytics dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-400/40 bg-red-500/10 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          <div className="bg-[#121712] border border-[#7ED957]/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Issues</p>
            <p className="text-3xl font-bold text-[#7ED957] mt-1">{stats?.totalComplaints || 0}</p>
          </div>
          <div className="bg-[#121712] border border-green-400/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Solved Issues</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{solved}</p>
          </div>
          <div className="bg-[#121712] border border-yellow-400/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Pending Issues</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{pending}</p>
          </div>
          <div className="bg-[#121712] border border-blue-400/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">SLA Compliance</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{stats?.slaComplianceRate || 0}%</p>
          </div>
          <div className="bg-[#121712] border border-orange-400/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Escalated Complaints</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">{escalatedStats?.total || 0}</p>
          </div>
        </div>

        <div className="bg-[#121712] border border-[#7ED957]/20 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Complaint Status Chart</h2>
              <p className="text-sm text-gray-400 mt-1">Solved vs pending complaints in circular form</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#111611', border: '1px solid #2f3e2f', borderRadius: '10px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Legend />
              <Pie
                data={complaintStatusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {complaintStatusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#121712] border border-cyan-400/20 rounded-xl p-6 mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Complaint Tracker</h2>
            <p className="text-sm text-gray-400 mt-1">
              Recent, weekly, and monthly monitoring snapshot of complaint activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { key: 'recent', title: 'Recent', subtitle: 'Last 24 hours', color: 'cyan' },
              { key: 'weekly', title: 'Weekly', subtitle: 'Last 7 days', color: 'blue' },
              { key: 'monthly', title: 'Monthly', subtitle: 'Last 30 days', color: 'purple' },
            ].map((item) => {
              const summary = trackerSummary?.[item.key] || { total: 0, resolved: 0, pending: 0 };
              const borderClass =
                item.color === 'cyan'
                  ? 'border-cyan-400/20'
                  : item.color === 'blue'
                    ? 'border-blue-400/20'
                    : 'border-purple-400/20';
              const accentClass =
                item.color === 'cyan'
                  ? 'text-cyan-300'
                  : item.color === 'blue'
                    ? 'text-blue-300'
                    : 'text-purple-300';

              return (
                <div key={item.key} className={`rounded-xl border ${borderClass} bg-[#0d140d] p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{item.subtitle}</p>
                    </div>
                    <span className={`text-sm font-semibold ${accentClass}`}>{summary.total} total</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-[#121712] px-4 py-3">
                      <span className="text-gray-400 text-sm">Resolved</span>
                      <span className="text-green-400 font-semibold">{summary.resolved}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-[#121712] px-4 py-3">
                      <span className="text-gray-400 text-sm">Pending / Active</span>
                      <span className="text-yellow-400 font-semibold">{summary.pending}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-[#121712] px-4 py-3">
                      <span className="text-gray-400 text-sm">Resolution Rate</span>
                      <span className={`font-semibold ${accentClass}`}>
                        {summary.total > 0 ? Math.round((summary.resolved / summary.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#121712] border border-orange-400/20 rounded-xl p-6 mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold">Escalated Complaints</h2>
              <p className="text-sm text-gray-400 mt-1">
                Complaints escalated from admin dashboards to ward offices.
              </p>
            </div>
            <div className="rounded-lg border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
              Total escalated: {escalatedStats?.total || 0}
            </div>
          </div>

          {escalatedComplaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-orange-400/20 bg-[#0a0f0a]/40 px-6 py-10 text-center text-gray-400">
              No escalated complaints found right now.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#7ED957]/10">
              <table className="w-full min-w-[760px]">
                <thead className="bg-[#0d140d]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tracking ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Locality</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Escalated By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7ED957]/10 bg-[#111611]/70">
                  {escalatedComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-orange-500/5">
                      <td className="px-4 py-3 text-sm text-orange-300">{complaint.trackingId || complaint.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{complaint.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{complaint.category?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300">
                          {complaint.priority || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{complaint.locality || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{complaint.escalatedBy || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Heatmap Visualization */}
        <div className="bg-[#121712] border border-[#7ED957]/20 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Geographic Complaint Heatmap</h2>
          <div style={{ height: '500px', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <PunjabMapController center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {heatmapData.map((locality, idx) => {
                  const coordinates = getCoordinatesForHeatmapItem(locality, idx);
                  if (!coordinates) {
                    return null;
                  }

                  const pending = locality.totalComplaints - locality.resolvedComplaints;
                  const urgency = pending > 5
                    ? 'CRITICAL'
                    : pending > 2
                      ? 'HIGH'
                      : pending > 0
                        ? 'ELEVATED'
                        : locality.resolvedComplaints > 0
                          ? 'RESOLVED'
                          : 'NORMAL';
                  const [lat, lng] = coordinates;
                  
                  // Color based on urgency
                  const colors = {
                    CRITICAL: '#ef4444',
                    HIGH: '#f97316',
                    ELEVATED: '#facc15',
                    RESOLVED: '#38bdf8',
                    NORMAL: '#22c55e',
                  };
                  
                  // Radius based on complaint count
                  const radius = Math.max(8, Math.min(30, locality.totalComplaints / 2));
                  const resolvedRadius = Math.max(4, Math.min(14, locality.resolvedComplaints + 3));

                  return (
                    <React.Fragment key={idx}>
                      <CircleMarker
                        center={[lat, lng]}
                        radius={radius}
                        fillColor={colors[urgency]}
                        color={colors[urgency]}
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.45}
                      >
                        <Popup>
                          <div style={{ color: '#000', fontSize: '12px' }}>
                            <strong>{locality.locality}</strong>
                            <br />
                            Total: {locality.totalComplaints}
                            <br />
                            Resolved: {locality.resolvedComplaints}
                            <br />
                            Pending: {pending}
                            <br />
                            <span style={{ 
                              color: colors[urgency],
                              fontWeight: 'bold'
                            }}>
                              {urgency}
                            </span>
                          </div>
                        </Popup>
                      </CircleMarker>

                      {locality.resolvedComplaints > 0 && (
                        <CircleMarker
                          center={[lat, lng]}
                          radius={resolvedRadius}
                          fillColor="#38bdf8"
                          color="#e0f2fe"
                          weight={2}
                          opacity={1}
                          fillOpacity={0.95}
                        >
                          <Popup>
                            <div style={{ color: '#000', fontSize: '12px' }}>
                              <strong>{locality.locality}</strong>
                              <br />
                              Resolved complaints: {locality.resolvedComplaints}
                              <br />
                              Pending complaints: {pending}
                            </div>
                          </Popup>
                        </CircleMarker>
                      )}
                    </React.Fragment>
                  );
                })}
            </MapContainer>

            {!hasHeatmapPoints && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-[#0a0f0a]/65 text-center text-gray-300">
                <div className="px-6">
                  <p className="text-lg font-medium">
                    {isHeatmapLoaded ? 'No geographic complaint data available yet.' : 'Loading heatmap data...'}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    {isHeatmapLoaded
                      ? 'The map is ready, but the API did not return any locality-level complaint points.'
                      : 'Fetching locality-wise complaint markers from the supervisor analytics API.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
              <span className="text-sm text-gray-400">Critical (6+ pending)</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#f97316', borderRadius: '50%' }}></div>
              <span className="text-sm text-gray-400">High (3-5 pending)</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#facc15', borderRadius: '50%' }}></div>
              <span className="text-sm text-gray-400">Elevated (1-2 pending)</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ width: '20px', height: '20px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></div>
              <span className="text-sm text-gray-400">Resolved overlay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
