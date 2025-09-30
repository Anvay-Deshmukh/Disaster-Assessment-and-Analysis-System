import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiMapPin, FiClock, FiUser, FiNavigation,
  FiActivity, FiCalendar, FiAlertCircle, FiMessageSquare,
  FiPackage, FiPlus, FiRadio, FiMap, FiUsers, FiTool, FiThermometer,
  FiDroplet, FiWind, FiAlertOctagon, FiCheckCircle, FiXCircle, FiLogOut,
  FiUserPlus, FiUserMinus, FiStar, FiAward, FiSettings, FiBell, FiBarChart
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, addHours, parseISO } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:5000/api';

const RescueDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State management
  const [state, setState] = useState({
    loading: true,
    userProfile: null,
    activeTab: 'overview',
    currentLocation: null,
    isOnline: true,
    activeAlerts: [],
    myTeams: [],
    availableTeams: [],
    teamInvitations: [],
    responseMetrics: {
      avgResponseTime: '12m 34s',
      successRate: '92%',
      alertsHandled: 47,
      missionsCompleted: 23
    }
  });

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fetch user profile and teams
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!currentUser) {
        updateState({ loading: false });
        return;
      }

      try {
        // Fetch user's teams
        const teamsResponse = await axios.get(`${API_URL}/teams`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Fetch available teams to join
        const availableTeamsResponse = await axios.get(`${API_URL}/teams/available`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (isMounted) {
          updateState({
            myTeams: teamsResponse.data.data.teams || [],
            availableTeams: availableTeamsResponse.data.data.teams || [],
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          updateState({ loading: false });
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, updateState]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateState({
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [updateState]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      showToast('Failed to log out', 'error');
    }
  }, [logout, navigate]);

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    updateState({ activeTab: tab });
  }, [updateState]);

  // Toggle online status
  const toggleOnlineStatus = useCallback(() => {
    updateState(prev => ({
      isOnline: !prev.isOnline
    }));
  }, [updateState]);

  // Join team
  const handleJoinTeam = async (teamId) => {
    try {
      await axios.post(`${API_URL}/teams/${teamId}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh teams data
      const teamsResponse = await axios.get(`${API_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      updateState({
        myTeams: teamsResponse.data.data.teams || []
      });
      showToast('Successfully joined the team', 'success');
    } catch (error) {
      console.error('Error joining team:', error);
      showToast(error.response?.data?.message || 'Failed to join team', 'error');
    }
  };

  // Incidents state and fetch
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      setIncidentsLoading(true);
      const res = await axios.get(`${API_URL}/incidents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setIncidents(res.data?.data?.incidents || []);
    } catch (e) {
      console.error('Failed to load incidents', e);
      showToast('Failed to load incidents', 'error');
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state.activeTab === 'alerts') {
      fetchIncidents();
    }
  }, [state.activeTab, fetchIncidents]);

  const acceptIncident = async (incidentId) => {
    try {
      if (state.myTeams.length === 0) {
        showToast('No teams available. Join or create a team first.', 'error');
        return;
      }
      const eta = prompt('Enter ETA in minutes (optional):', '30');
      // pick a team if only one; otherwise ask
      let teamId = state.myTeams[0]?._id;
      if (state.myTeams.length > 1) {
        const names = state.myTeams.map((t, i) => `${i + 1}. ${t.name}`).join('\n');
        const idx = prompt(`Select Team by number:\n${names}`, '1');
        const sel = parseInt(idx, 10) - 1;
        if (!isNaN(sel) && state.myTeams[sel]?._id) teamId = state.myTeams[sel]._id;
      }
      await axios.post(`${API_URL}/incidents/${incidentId}/accept`, { teamId, etaMinutes: eta ? parseInt(eta, 10) : undefined }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchIncidents();
      showToast('Incident accepted', 'success');
    } catch (e) {
      console.error(e);
      showToast(e.response?.data?.message || 'Failed to accept', 'error');
    }
  };

  // Leave team
  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/teams/${teamId}/leave`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh teams data
      const teamsResponse = await axios.get(`${API_URL}/teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
          updateState({
        myTeams: teamsResponse.data.data.teams || []
          });
      showToast('Successfully left the team', 'success');
      } catch (error) {
      console.error('Error leaving team:', error);
      showToast(error.response?.data?.message || 'Failed to leave team', 'error');
    }
  };

  // Mock data for charts
  const chartData = {
    weeklyActivity: [
      { name: 'Mon', alerts: 12, responses: 10 },
      { name: 'Tue', alerts: 19, responses: 18 },
      { name: 'Wed', alerts: 15, responses: 14 },
      { name: 'Thu', alerts: 27, responses: 25 },
      { name: 'Fri', alerts: 18, responses: 17 },
      { name: 'Sat', alerts: 23, responses: 21 },
      { name: 'Sun', alerts: 19, responses: 18 }
    ],
    alertTypes: [
      { name: 'Medical', value: 35, color: '#EF4444' },
      { name: 'Fire', value: 25, color: '#F59E0B' },
      { name: 'Flood', value: 20, color: '#3B82F6' },
      { name: 'Earthquake', value: 15, color: '#8B5CF6' },
      { name: 'Other', value: 5, color: '#6B7280' }
    ]
  };

  if (state.loading) {
  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg border-b border-gray-700 mb-6">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-white">ResQ AI</h1>
                <p className="text-sm text-gray-400">Rescue Operations Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                      {currentUser?.displayName?.charAt(0) || 'R'}
                  </span>
                </div>
                <div className="text-left">
                    <p className="text-sm font-medium text-white">{currentUser?.displayName || 'Rescue Team'}</p>
                    <p className="text-xs text-gray-400">Rescue Member</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleOnlineStatus}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                      state.isOnline
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50'
                      : 'bg-red-900/30 text-red-400 hover:bg-red-800/50'
                    }`}
                >
                    <span className={`h-2 w-2 rounded-full ${state.isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span>{state.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-4 flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: FiActivity },
                { id: 'teams', label: 'My Teams', icon: FiUsers },
                { id: 'join', label: 'Join Teams', icon: FiUserPlus },
                { id: 'alerts', label: 'Alerts', icon: FiBell },
                { id: 'map', label: 'Map', icon: FiMap },
                { id: 'analytics', label: 'Analytics', icon: FiBarChart }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
              <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors flex items-center space-x-2 ${
                      state.activeTab === tab.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
              >
                    <IconComponent size={16} />
                    <span>{tab.label}</span>
              </button>
                );
              })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            {state.activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
        {/* Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg. Response Time</p>
                        <p className="text-2xl font-bold text-white">12m 34s</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                <FiClock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1 w-full bg-gray-700 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Faster than 85% of teams</p>
            </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-white">92%</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                <FiCheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1 w-full bg-gray-700 rounded-full">
                <div className="h-1 bg-green-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">+2.5% from last week</p>
            </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
            <div className="flex items-center justify-between">
              <div>
                        <p className="text-sm font-medium text-gray-400">My Teams</p>
                        <p className="text-2xl font-bold text-white">{state.myTeams.length}</p>
              </div>
                      <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                        <FiUsers className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-2">
                      <p className="text-xs text-gray-400">Active teams you're part of</p>
              </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
                          <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Missions Completed</p>
                        <p className="text-2xl font-bold text-white">23</p>
                          </div>
                      <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
                        <FiAward className="h-6 w-6" />
                          </div>
                        </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">This month</p>
                      </div>
                  </motion.div>
            </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-medium text-white mb-4">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.weeklyActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                          <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        color: '#F3F4F6'
                      }}
                    />
                          <Line type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} />
                          <Line type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
                </ResponsiveContainer>
              </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-medium text-white mb-4">Alert Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                            data={chartData.alertTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                            {chartData.alertTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        color: '#F3F4F6'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                      </div>
                  </motion.div>
            </div>

            {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => handleTabChange('teams')}
                      className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 mb-2">
                        <FiUsers className="h-6 w-6" />
                  </div>
                      <span className="text-sm text-white">My Teams</span>
                </button>
                    <button
                      onClick={() => handleTabChange('join')}
                      className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="p-3 rounded-full bg-green-500/20 text-green-400 mb-2">
                        <FiUserPlus className="h-6 w-6" />
                  </div>
                      <span className="text-sm text-white">Join Team</span>
                </button>
                    <button
                      onClick={() => handleTabChange('alerts')}
                      className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400 mb-2">
                        <FiBell className="h-6 w-6" />
                  </div>
                      <span className="text-sm text-white">View Alerts</span>
                </button>
                    <button
                      onClick={() => handleTabChange('map')}
                      className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <div className="p-3 rounded-full bg-purple-500/20 text-purple-400 mb-2">
                        <FiMap className="h-6 w-6" />
                  </div>
                      <span className="text-sm text-white">Open Map</span>
                </button>
              </div>
                </motion.div>
              </motion.div>
            )}

            {state.activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">My Teams</h2>
                  <button
                    onClick={() => handleTabChange('join')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FiUserPlus size={16} />
                    <span>Join New Team</span>
                </button>
              </div>

                {state.myTeams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.myTeams.map((team) => (
                      <motion.div
                        key={team._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-600 rounded-lg">
                                <FiUsers className="h-5 w-5 text-white" />
                  </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                                <p className="text-sm text-gray-400">{team.specialization?.join(', ') || 'General'}</p>
              </div>
              </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              team.status === 'active' ? 'bg-green-900 text-green-300' :
                              team.status === 'inactive' ? 'bg-gray-700 text-gray-300' :
                              'bg-blue-900 text-blue-300'
                            }`}>
                              {team.status}
                            </span>
            </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-400">
                              <FiMapPin className="h-4 w-4 mr-2" />
                              <span>{team.location?.city}, {team.location?.state}</span>
            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <FiUsers className="h-4 w-4 mr-2" />
                              <span>{team.members?.length + 1} / {team.capacity} members</span>
            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <FiStar className="h-4 w-4 mr-2" />
                              <span>Leader: {team.leader?.name || 'Unknown'}</span>
          </div>
        </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/teams/${team._id}`)}
                              className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleLeaveTeam(team._id)}
                              className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                            >
                              <FiUserMinus size={14} className="mr-1" />
                              Leave
                            </button>
            </div>
            </div>
                      </motion.div>
                    ))}
          </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FiUsers className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No teams yet</h3>
                    <p className="text-gray-500 mb-4">You haven't joined any teams yet. Start by joining an existing team or create your own.</p>
                    <button
                      onClick={() => handleTabChange('join')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Available Teams
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {state.activeTab === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Available Teams to Join</h2>
                  <button
                    onClick={() => navigate('/teams/create')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FiPlus size={16} />
                    <span>Create Team</span>
                  </button>
      </div>

                {state.availableTeams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {state.availableTeams.map((team) => (
                      <motion.div
                        key={team._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-600 rounded-lg">
                                <FiUsers className="h-5 w-5 text-white" />
        </div>
                  <div>
                                <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                                <p className="text-sm text-gray-400">{team.specialization?.join(', ') || 'General'}</p>
                    </div>
                    </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              team.status === 'active' ? 'bg-green-900 text-green-300' :
                              team.status === 'inactive' ? 'bg-gray-700 text-gray-300' :
                              'bg-blue-900 text-blue-300'
                            }`}>
                              {team.status}
                    </span>
                  </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-400">
                              <FiMapPin className="h-4 w-4 mr-2" />
                              <span>{team.location?.city}, {team.location?.state}</span>
                </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <FiUsers className="h-4 w-4 mr-2" />
                              <span>{team.members?.length + 1} / {team.capacity} members</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <FiStar className="h-4 w-4 mr-2" />
                              <span>Leader: {team.leader?.name || 'Unknown'}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                  <button
                              onClick={() => navigate(`/teams/${team._id}`)}
                              className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                  >
                              View Details
                  </button>
                            <button
                              onClick={() => handleJoinTeam(team._id)}
                              className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center"
                            >
                              <FiUserPlus size={14} className="mr-1" />
                              Join
                  </button>
                </div>
              </div>
                      </motion.div>
                    ))}
            </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FiUsers className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No teams available</h3>
                    <p className="text-gray-500 mb-4">There are no teams available to join at the moment. Consider creating your own team!</p>
                    <button
                      onClick={() => navigate('/teams/create')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create New Team
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {state.activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Location & Map</h2>
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Current Location</h3>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Refresh Location
                      </button>
        </div>
                    <div className="h-96 bg-gray-700 rounded-lg overflow-hidden">
                      {state.currentLocation ? (
                        <MapContainer
                          center={[state.currentLocation.lat, state.currentLocation.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[state.currentLocation.lat, state.currentLocation.lng]}>
                            <Popup>Your current location</Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <p>Loading map...</p>
      </div>
                      )}
      </div>
                    <div className="mt-4 text-sm text-gray-400">
                      <p>Last updated: {new Date().toLocaleTimeString()}</p>
                      {state.currentLocation && (
                        <p>Coordinates: {state.currentLocation.lat.toFixed(4)}, {state.currentLocation.lng.toFixed(4)}</p>
                      )}
          </div>
              </div>
              </div>
              </motion.div>
            )}

            {state.activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Emergency Alerts</h2>
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Active Incidents</h3>
                    <button onClick={fetchIncidents} className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md">Refresh</button>
          </div>
                  {incidentsLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading incidents...</div>
                  ) : incidents.length === 0 ? (
                    <div className="p-6 text-center">
                      <FiBell className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">No active incidents</h3>
                      <p className="text-gray-500">You're all caught up for now.</p>
        </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {incidents.map((inc) => (
                        <div key={inc._id} className="p-4 hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{inc.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  inc.status === 'new' ? 'bg-yellow-900 text-yellow-300' :
                                  inc.status === 'assigned' ? 'bg-blue-900 text-blue-300' :
                                  inc.status === 'accepted' ? 'bg-green-900 text-green-300' :
                                  inc.status === 'cancelled' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'
                                }`}>{inc.status}</span>
    </div>
                              <p className="text-sm text-gray-400 mt-1">{inc.description || 'No description'}</p>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <FiMapPin className="h-3.5 w-3.5 mr-1" />
                                <span>{inc.location?.city}, {inc.location?.state}</span>
    </div>
        </div>
                            <div className="flex items-center gap-2">
                              {inc.status !== 'accepted' && (
                                <button
                                  onClick={() => acceptIncident(inc._id)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                                >
                                  Accept
      </button>
                              )}
        </div>
        </div>
        </div>
                      ))}
    </div>
                  )}
    </div>
              </motion.div>
            )}

            {state.activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Response Time Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.weeklyActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                          <YAxis tick={{ fill: '#9CA3AF' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '0.375rem',
                              color: '#F3F4F6'
                            }}
                          />
                          <Line type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={2} />
                        </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Team Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Response Rate</span>
                        <span className="text-white font-semibold">95%</span>
            </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Avg Mission Time</span>
                        <span className="text-white font-semibold">2h 15m</span>
            </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Team Rating</span>
                        <span className="text-white font-semibold">4.8/5.0</span>
            </div>
            </div>
        </div>
      </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        </div>
    </div>
  );
};

export default RescueDashboard;