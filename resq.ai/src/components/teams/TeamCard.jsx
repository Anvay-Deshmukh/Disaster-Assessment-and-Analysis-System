import React from 'react';
import { FiUsers, FiMapPin, FiStar, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TeamCard = ({ team, onEdit, onDelete, onView, userRole, currentUserId }) => {
  const isLeader = team.leader._id === currentUserId;
  const canEdit = userRole === 'admin' || isLeader;
  const canDelete = userRole === 'admin';

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_mission': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpecializationColor = (spec) => {
    const colors = {
      medical: 'bg-red-100 text-red-800',
      evacuation: 'bg-orange-100 text-orange-800',
      fire: 'bg-red-100 text-red-800',
      flood: 'bg-blue-100 text-blue-800',
      earthquake: 'bg-yellow-100 text-yellow-800',
      rescue: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[spec] || colors.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{team.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                {team.status.replace('_', ' ')}
              </span>
              {isLeader && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Leader
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onView(team)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <FiEye size={16} />
            </button>
            {canEdit && (
              <button
                onClick={() => onEdit(team)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit Team"
              >
                <FiEdit size={16} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(team._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Team"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        {team.location && (
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <FiMapPin size={16} />
            <span className="text-sm">
              {team.location.city && team.location.state 
                ? `${team.location.city}, ${team.location.state}`
                : team.location.address || 'Location not specified'
              }
            </span>
          </div>
        )}

        {/* Specializations */}
        {team.specialization && team.specialization.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {team.specialization.map((spec, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSpecializationColor(spec)}`}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FiUsers size={16} />
              <span>{team.memberCount || team.members.length + 1} members</span>
            </div>
            <div className="flex items-center gap-1">
              <FiStar size={16} />
              <span>Capacity: {team.capacity}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Leader Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Leader:</span>
            <span>{team.leader.name}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamCard;
