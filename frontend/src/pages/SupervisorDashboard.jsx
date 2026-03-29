import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';
import { supervisorService, complaintService } from '../services/apiService';

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supervisor, setSupervisor] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [locationPoints, setLocationPoints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

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
      const [dashboardRes, heatmapRes] = await Promise.all([
        supervisorService.getDashboard(),
        supervisorService.getHeatmap(),
      ]);

      const dashboard = dashboardRes.data || {};
      const heatmap = heatmapRes.data || {};

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
      setLocationPoints((heatmap.heatmapData || []).slice(0, 200));
      setHotspots(heatmap.hotspots || []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      try {
        // Fallback: use complaint endpoints so supervisor can still see live counts/graphs.
        const [statsRes, complaintsRes] = await Promise.all([
          complaintService.getStats(),
          complaintService.getAllComplaints({ limit: 500 }),
        ]);

        const statsData = statsRes?.data?.stats || {};
        const allComplaints = complaintsRes?.data?.complaints || [];

        setStats({
          totalComplaints: statsData.totalComplaints || allComplaints.length || 0,
          resolvedComplaints: statsData.resolvedComplaints || 0,
          pendingComplaints: (statsData.pendingComplaints || 0) + (statsData.assignedComplaints || 0),
          inProgressComplaints: statsData.inProgressComplaints || 0,
          slaComplianceRate: 0,
        });

        const byMonth = {};
        allComplaints.forEach((complaint) => {
          if (!complaint?.createdAt) return;
          const date = new Date(complaint.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!byMonth[key]) {
            byMonth[key] = { month: key, resolved: 0, pending: 0, total: 0 };
          }
          byMonth[key].total += 1;
          if (complaint.status === 'RESOLVED') {
            byMonth[key].resolved += 1;
          } else {
            byMonth[key].pending += 1;
          }
        });

        setTrendData(Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)));

        const points = allComplaints
          .filter((c) => c?.location?.coordinates?.length === 2)
          .map((c) => ({
            lat: c.location.coordinates[1],
            lng: c.location.coordinates[0],
            category: c.category,
            status: c.status,
          }));

        setLocationPoints(points.slice(0, 200));
        setHotspots([]);
        setLastUpdated(new Date());
        setError('');
      } catch (fallbackErr) {
        setError(
          fallbackErr?.response?.data?.message ||
            err?.response?.data?.message ||
            'Failed to load analytics data'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isValidSession = loadSession();
    if (!isValidSession) {
      setLoading(false);
      return;
    }

    fetchRealtimeData();
    const intervalId = setInterval(fetchRealtimeData, 30000);

    return () => clearInterval(intervalId);
  }, [loadSession, fetchRealtimeData]);

  const handleLogout = async () => {
    await logout();
    navigate('/supervisor-login');
  };

  const solved = stats?.resolvedComplaints || 0;
  const pending = (stats?.pendingComplaints || 0) + (stats?.inProgressComplaints || 0);

  const derivedHotspots = useMemo(() => {
    if (hotspots.length > 0) return hotspots;
    if (!locationPoints.length) return [];

    const grid = new Map();
    locationPoints.forEach((point) => {
      if (typeof point.lat !== 'number' || typeof point.lng !== 'number') return;
      const latKey = point.lat.toFixed(2);
      const lngKey = point.lng.toFixed(2);
      const key = `${latKey}, ${lngKey}`;
      const current = grid.get(key) || 0;
      grid.set(key, current + 1);
    });

    return Array.from(grid.entries())
      .map(([coordinates, complaintCount]) => ({ coordinates, complaintCount }))
      .sort((a, b) => b.complaintCount - a.complaintCount)
      .slice(0, 5);
  }, [hotspots, locationPoints]);

  const locationInsight = useMemo(() => {
    if (!locationPoints.length) {
      return {
        totalPoints: 0,
        clusters: 0,
        spreadLabel: 'No coverage yet',
        centerLabel: 'Waiting for geo points',
      };
    }

    const lats = locationPoints.map((p) => p.lat).filter((v) => typeof v === 'number');
    const lngs = locationPoints.map((p) => p.lng).filter((v) => typeof v === 'number');
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spreadLat = Math.abs(maxLat - minLat);
    const spreadLng = Math.abs(maxLng - minLng);
    const spread = Math.max(spreadLat, spreadLng);
    const spreadLabel =
      spread < 0.02 ? 'Tight cluster' : spread < 0.05 ? 'Neighborhood scale' : 'City-wide spread';
    const centerLat = ((minLat + maxLat) / 2).toFixed(3);
    const centerLng = ((minLng + maxLng) / 2).toFixed(3);

    return {
      totalPoints: locationPoints.length,
      clusters: derivedHotspots.length,
      spreadLabel,
      centerLabel: `${centerLat}, ${centerLng}`,
    };
  }, [derivedHotspots.length, locationPoints]);

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
              Auto-refresh every 30s{lastUpdated ? ` | Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#121712] border border-[#7ED957]/20 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">Solved vs Pending Trend</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#273327" />
                <XAxis dataKey="month" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip contentStyle={{ backgroundColor: '#111611', border: '1px solid #2f3e2f' }} />
                <Legend />
                <Line type="monotone" dataKey="resolved" stroke="#4ade80" strokeWidth={2} name="Solved" />
                <Line type="monotone" dataKey="pending" stroke="#facc15" strokeWidth={2} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#121712] border border-[#7ED957]/20 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Issue Locations (Lat/Lng)</h2>
                <p className="text-sm text-gray-400 mt-1">Geo coverage and hotspots</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>Center</div>
                <div className="text-gray-300 font-semibold">{locationInsight.centerLabel}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-[#0d120d] border border-[#2f3e2f] rounded-lg p-3">
                <p className="text-xs text-gray-400">Mapped Points</p>
                <p className="text-lg font-semibold text-[#7ED957]">{locationInsight.totalPoints}</p>
              </div>
              <div className="bg-[#0d120d] border border-[#2f3e2f] rounded-lg p-3">
                <p className="text-xs text-gray-400">Active Clusters</p>
                <p className="text-lg font-semibold text-blue-300">{locationInsight.clusters}</p>
              </div>
              <div className="bg-[#0d120d] border border-[#2f3e2f] rounded-lg p-3">
                <p className="text-xs text-gray-400">Spread</p>
                <p className="text-lg font-semibold text-amber-300">{locationInsight.spreadLabel}</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#2f3e2f] bg-gradient-to-br from-[#0d120d] via-[#111611] to-[#0a0f0a] p-3">
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid stroke="#273327" />
                  <XAxis type="number" dataKey="lng" name="Longitude" stroke="#a3a3a3" domain={['auto', 'auto']} />
                  <YAxis type="number" dataKey="lat" name="Latitude" stroke="#a3a3a3" domain={['auto', 'auto']} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#111611', border: '1px solid #2f3e2f' }}
                  />
                  <Scatter data={locationPoints} fill="#7ED957" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#121712] border border-[#7ED957]/20 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Top Hotspot Areas</h2>
            <p className="text-xs text-gray-500">
              {hotspots.length > 0 ? 'From live clustering' : 'Estimated from live coordinates'}
            </p>
          </div>
          {derivedHotspots.length === 0 ? (
            <div className="text-gray-400">
              No location hotspots found yet. Hotspots appear once complaints include coordinates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-[#2f3e2f]">
                    <th className="py-2 pr-4">Approx. Coordinates</th>
                    <th className="py-2 pr-4">Issue Count</th>
                    <th className="py-2 pr-4">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {derivedHotspots.map((spot) => (
                    <tr key={spot.coordinates} className="border-b border-[#1d261d]">
                      <td className="py-2 pr-4 text-gray-200">{spot.coordinates}</td>
                      <td className="py-2 pr-4 text-[#7ED957] font-semibold">{spot.complaintCount}</td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-500/15 text-amber-200">
                          Review priority
                        </span>
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
