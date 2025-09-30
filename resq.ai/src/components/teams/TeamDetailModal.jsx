import React, { useState } from 'react';
import { FiX, FiEdit, FiTrash2, FiUserPlus, FiUserMinus, FiAward, FiMapPin, FiPhone, FiMail, FiUsers, FiStar, FiCalendar, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const TeamDetailModal = ({ team, isOpen, onClose, onEdit, userRole, currentUserId }) => {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'member'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!team || !isOpen) return null;

  const isLeader = team.leader._id === currentUserId;
  const canEdit = userRole === 'admin' || isLeader;
  const canDelete = userRole === 'admin';
  const canManageMembers = userRole === 'admin' || isLeader;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-300';
      case 'inactive': return 'bg-gray-700 text-gray-300';
      case 'on_mission': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getSpecializationColor = (spec) => {
    const colors = {
      medical: 'bg-red-900 text-red-300',
      evacuation: 'bg-orange-900 text-orange-300',
      fire: 'bg-red-900 text-red-300',
      flood: 'bg-blue-900 text-blue-300',
      earthquake: 'bg-yellow-900 text-yellow-300',
      rescue: 'bg-purple-900 text-purple-300',
      other: 'bg-gray-700 text-gray-300'
    };
    return colors[spec] || colors.other;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'supervisor': return 'bg-purple-900 text-purple-300';
      case 'member': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  // Add member to team
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberForm.email.trim()) return;

    setIsSubmitting(true);
    try {
      // First, find user by email
      const userResponse = await axios.get(`${API_URL}/users/search?email=${memberForm.email}`);
      if (userResponse.data.data.users.length === 0) {
        alert('User not found with this email');
        return;
      }

      const userId = userResponse.data.data.users[0]._id;
      
      // Add member to team
      await axios.post(`${API_URL}/teams/${team._id}/members`, {
        userId,
        role: memberForm.role
      });

      // Reset form and close
      setMemberForm({ email: '', role: 'member' });
      setShowMemberForm(false);
      
      // Refresh the page to show updated team data
      window.location.reload();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove member from team
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/teams/${team._id}/members/${userId}`);
      window.location.reload();
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Change team leader
  const handleChangeLeader = async (userId) => {
    if (!window.confirm('Are you sure you want to change the team leader?')) {
      return;
    }

    try {
      await axios.patch(`${API_URL}/teams/${team._id}/leader`, {
        newLeaderId: userId
      });
      window.location.reload();
    } catch (error) {
      console.error('Error changing leader:', error);
      alert(error.response?.data?.message || 'Failed to change leader');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900 rounded-lg">
                <FiUsers size={24} className="text-blue-300" />
              </div>
            <div>
                <h2 className="text-2xl font-semibold text-white">{team.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                  {team.status.replace('_', ' ')}
                </span>
                  <span className="text-sm text-gray-400">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit(team)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Edit Team"
                >
                  <FiEdit size={20} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this team?')) {
                      // Handle delete
                      onClose();
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Team"
                >
                  <FiTrash2 size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Team Info */}
              <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FiStar size={20} className="text-blue-400" />
                  Team Information
                </h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Capacity</label>
                      <p className="text-lg font-semibold text-white">{team.capacity} members</p>
                  </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Current Members</label>
                      <p className="text-lg font-semibold text-white">{team.memberCount || team.members.length + 1}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
                {team.location && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <FiMapPin size={20} className="text-green-400" />
                  Location
                </h3>
                
                  <div className="space-y-2">
                    {team.location.address && (
                        <p className="text-gray-300">{team.location.address}</p>
                    )}
                      <p className="text-gray-300">
                      {team.location.city && team.location.state 
                        ? `${team.location.city}, ${team.location.state}`
                        : 'Location not specified'
                      }
                    </p>
                    {team.location.pincode && (
                        <p className="text-gray-300">Pincode: {team.location.pincode}</p>
                    )}
                      {team.location.coordinates && team.location.coordinates.length === 2 && (
                        <p className="text-sm text-gray-500">
                          Coordinates: {team.location.coordinates[0].toFixed(6)}, {team.location.coordinates[1].toFixed(6)}
                        </p>
                )}
              </div>
            </div>
                )}

            {/* Specializations */}
            {team.specialization && team.specialization.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {team.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSpecializationColor(spec)}`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {team.contact && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <FiPhone size={20} className="text-purple-400" />
                  Contact Information
                </h3>
                    
                    <div className="space-y-2">
                  {team.contact.phone && (
                        <p className="flex items-center gap-2 text-gray-300">
                          <FiPhone size={16} />
                          {team.contact.phone}
                        </p>
                  )}
                  {team.contact.email && (
                        <p className="flex items-center gap-2 text-gray-300">
                          <FiMail size={16} />
                          {team.contact.email}
                        </p>
                  )}
                  {team.contact.emergencyContact && (
                        <p className="flex items-center gap-2 text-gray-300">
                          <FiAlertTriangle size={16} />
                          Emergency: {team.contact.emergencyContact}
                        </p>
                  )}
                </div>
              </div>
            )}
              </div>

              {/* Right Column - Members */}
              <div className="space-y-6">
                {/* Team Leader */}
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                  <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center gap-2">
                    <FiAward size={20} className="text-yellow-400" />
                    Team Leader
              </h3>
              
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {team.leader.name?.charAt(0) || 'L'}
                  </div>
                  <div>
                      <p className="font-medium text-blue-300">{team.leader.name}</p>
                      <p className="text-sm text-blue-400">{team.leader.email}</p>
                  </div>
                </div>
              </div>

                {/* Team Members */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">Team Members</h3>
                    {canManageMembers && (
                      <button
                        onClick={() => setShowMemberForm(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FiUserPlus size={16} />
                        Add Member
                      </button>
                    )}
                  </div>
                  
                  <div className="divide-y divide-gray-700">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((member) => (
                        <div key={member.user._id} className="p-4 hover:bg-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-medium">
                                {member.user.name?.charAt(0) || 'M'}
                        </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-white">{member.user.name}</p>
                                <p className="text-xs text-gray-400">{member.user.email}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                            
                            {canManageMembers && (
                              <div className="flex items-center gap-2">
                                {canEdit && (
                                  <button
                                    onClick={() => handleChangeLeader(member.user._id)}
                                    className="p-1 text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
                                    title="Make Leader"
                                  >
                                    <FiAward size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveMember(member.user._id)}
                                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                  title="Remove Member"
                                >
                                  <FiUserMinus size={16} />
                                </button>
                              </div>
                            )}
                      </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <FiUsers size={24} className="mx-auto mb-2 text-gray-600" />
                        <p>No additional members yet</p>
                </div>
              )}
            </div>
          </div>
              </div>
            </div>
          </div>

          {/* Add Member Modal */}
          <AnimatePresence>
            {showMemberForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Add Team Member</h3>
                    
                    <form onSubmit={handleAddMember} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={memberForm.email}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                          placeholder="Enter member's email"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Role
                        </label>
                        <select
                          value={memberForm.role}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                        >
                          <option value="member">Member</option>
                          <option value="supervisor">Supervisor</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowMemberForm(false)}
                          className="px-4 py-2 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamDetailModal;

