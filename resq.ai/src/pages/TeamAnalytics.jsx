import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FiUsers, FiMapPin, FiActivity, FiTrendingUp, FiTrendingDown, FiStar, FiAlertTriangle } from 'react-icons/fi';

const TeamAnalytics = () => {
  const { currentUser, loading } = useAuth();
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    avgTeamSize: 0,
    specializationDistribution: [],
    locationDistribution: [],
    teamStatusDistribution: [],
    monthlyGrowth: []
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchTeamAnalytics();
    }
  }, [currentUser]);

  const fetchTeamAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch('http://localhost:5000/api/teams');
      const data = await response.json();
      
      if (data.status === 'success') {
        const teamsData = data.data.teams;
        setTeams(teamsData);
        calculateAnalytics(teamsData);
      }
    } catch (error) {
      console.error('Error fetching team analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const calculateAnalytics = (teamsData) => {
    const totalTeams = teamsData.length;
    const activeTeams = teamsData.filter(team => team.status === 'active').length;
    const totalMembers = teamsData.reduce((sum, team) => sum + (team.memberCount || team.members.length + 1), 0);
    const avgTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : 0;

    // Specialization distribution
    const specializationCount = {};
    teamsData.forEach(team => {
      if (team.specialization) {
        team.specialization.forEach(spec => {
          specializationCount[spec] = (specializationCount[spec] || 0) + 1;
        });
      }
    });
    const specializationDistribution = Object.entries(specializationCount).map(([name, value]) => ({ name, value }));

    // Location distribution (by state)
    const locationCount = {};
    teamsData.forEach(team => {
      if (team.location?.state) {
        locationCount[team.location.state] = (locationCount[team.location.state] || 0) + 1;
      }
    });
    const locationDistribution = Object.entries(locationCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Team status distribution
    const statusCount = {};
    teamsData.forEach(team => {
      statusCount[team.status] = (statusCount[team.status] || 0) + 1;
    });
    const teamStatusDistribution = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Monthly growth (mock data for now)
    const monthlyGrowth = [
      { month: 'Jan', teams: 12, members: 45 },
      { month: 'Feb', teams: 15, members: 58 },
      { month: 'Mar', teams: 18, members: 72 },
      { month: 'Apr', teams: 22, members: 89 },
      { month: 'May', teams: 25, members: 105 },
      { month: 'Jun', teams: 28, members: 120 }
    ];

    setAnalytics({
      totalTeams,
      activeTeams,
      totalMembers,
      avgTeamSize,
      specializationDistribution,
      locationDistribution,
      teamStatusDistribution,
      monthlyGrowth
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loadingAnalytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Team Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive overview of all rescue teams and their performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-900 rounded-lg">
                <FiUsers className="h-6 w-6 text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Teams</p>
                <p className="text-2xl font-bold text-white">{analytics.totalTeams}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-900 rounded-lg">
                <FiActivity className="h-6 w-6 text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Teams</p>
                <p className="text-2xl font-bold text-white">{analytics.activeTeams}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-900 rounded-lg">
                <FiUsers className="h-6 w-6 text-purple-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-white">{analytics.totalMembers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-900 rounded-lg">
                <FiStar className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Avg Team Size</p>
                <p className="text-2xl font-bold text-white">{analytics.avgTeamSize}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Specialization Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <h3 className="text-lg font-medium text-white mb-4">Team Specializations</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.specializationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.specializationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Team Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <h3 className="text-lg font-medium text-white mb-4">Team Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.teamStatusDistribution}>
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
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <h3 className="text-lg font-medium text-white mb-4">Monthly Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area type="monotone" dataKey="teams" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="members" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
          >
            <h3 className="text-lg font-medium text-white mb-4">Top Locations by Team Count</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.locationDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                      color: '#F3F4F6'
                    }}
                  />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg shadow-lg border border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Recent Teams</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {teams.slice(0, 10).map((team) => (
                  <tr key={team._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                          <FiUsers className="h-5 w-5 text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{team.name}</div>
                          <div className="text-sm text-gray-400">
                            {team.specialization?.join(', ') || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        team.status === 'active' ? 'bg-green-900 text-green-300' :
                        team.status === 'inactive' ? 'bg-gray-700 text-gray-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {team.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {team.memberCount || team.members.length + 1} / {team.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-white">
                        <FiMapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {team.location?.city || 'N/A'}, {team.location?.state || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
