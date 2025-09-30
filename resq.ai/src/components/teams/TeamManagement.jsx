import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TeamCard from './TeamCard';
import TeamForm from './TeamForm';
import TeamDetailModal from './TeamDetailModal';

const API_URL = 'http://localhost:5000/api';

const TeamManagement = ({ userRole, showCreateButton = true, filterByUser = false }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  const specializations = [
    'medical', 'evacuation', 'fire', 'flood', 'earthquake', 'rescue', 'other'
  ];

  const statuses = ['all', 'active', 'inactive', 'on_mission'];

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/teams`;
      
      // If filtering by user, get teams where user is leader or member
      if (filterByUser && currentUser) {
        // For now, we'll fetch all teams and filter client-side
        // In a real app, you might want a specific endpoint for user's teams
      }
      
      const response = await axios.get(url);
      let fetchedTeams = response.data.data.teams;
      
      // Filter by user if needed
      if (filterByUser && currentUser) {
        fetchedTeams = fetchedTeams.filter(team => 
          team.leader._id === currentUser._id || 
          team.members.some(member => member.user._id === currentUser._id)
        );
      }
      
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      showToast('Failed to fetch teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [filterByUser, currentUser]);

  // Create team
  const handleCreateTeam = async (teamData) => {
    try {
      const response = await axios.post(`${API_URL}/teams`, teamData);
      showToast('Team created successfully!', 'success');
      setShowForm(false);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      showToast(error.response?.data?.message || 'Failed to create team', 'error');
    }
  };

  // Update team
  const handleUpdateTeam = async (teamData) => {
    try {
      const response = await axios.patch(`${API_URL}/teams/${editingTeam._id}`, teamData);
      showToast('Team updated successfully!', 'success');
      setShowForm(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      showToast(error.response?.data?.message || 'Failed to update team', 'error');
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/teams/${teamId}`);
      showToast('Team deleted successfully!', 'success');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast(error.response?.data?.message || 'Failed to delete team', 'error');
    }
  };

  // Edit team
  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  // View team details
  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
  };

  // Filter teams
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.location?.state?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    
    const matchesSpecialization = specializationFilter === 'all' || 
                                 team.specialization.includes(specializationFilter);
    
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Handle form submission
  const handleFormSubmit = (data) => {
    if (editingTeam) {
      handleUpdateTeam(data);
    } else {
      handleCreateTeam(data);
    }
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeam(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {filterByUser ? 'My Teams' : 'All Teams'}
          </h2>
          <p className="text-gray-600 mt-1">
            {filterByUser ? 'Manage your rescue teams' : 'Manage all rescue teams in the system'}
          </p>
        </div>
        
        {showCreateButton && (userRole === 'admin' || userRole === 'rescue') && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiPlus size={20} />
            Create Team
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec.charAt(0).toUpperCase() + spec.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div>
            <button
              onClick={fetchTeams}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiSearch size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'No teams have been created yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
                onView={handleViewTeam}
                userRole={userRole}
                currentUserId={currentUser?._id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Team Form Modal */}
      <TeamForm
        team={editingTeam}
        onSubmit={handleFormSubmit}
        onCancel={handleCloseForm}
        isOpen={showForm}
      />

      {/* Team Detail Modal */}
      <TeamDetailModal
        team={selectedTeam}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEditTeam}
        userRole={userRole}
        currentUserId={currentUser?._id}
      />
    </div>
  );
};

export default TeamManagement;

