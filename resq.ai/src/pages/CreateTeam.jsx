import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TeamForm from '../components/teams/TeamForm';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';

const CreateTeam = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has permission to create teams
  if (!currentUser || !['admin', 'rescue'].includes(currentUser.role)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiUsers size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to create teams.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCreateTeam = async (teamData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teamData)
      });

      if (!response.ok) {
        throw new Error('Failed to create team');
      }

      const result = await response.json();
      showToast('Team created successfully!', 'success');
      navigate('/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      showToast('Failed to create team. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/teams');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teams')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Team</h1>
              <p className="text-gray-400">Set up a new rescue team with all necessary details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Team Information</h2>
            <p className="text-sm text-gray-400 mt-1">
              Fill in the details below to create your new rescue team. All fields marked with * are required.
            </p>
          </div>
          
          <TeamForm
            onSubmit={handleCreateTeam}
            onCancel={handleCancel}
            isOpen={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
