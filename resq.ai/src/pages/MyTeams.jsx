import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import TeamManagement from '../components/teams/TeamManagement';

const MyTeams = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user doesn't have permission to view teams
  if (!['admin', 'rescue'].includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamManagement 
          userRole={currentUser.role}
          showCreateButton={true}
          filterByUser={true}
        />
      </div>
    </div>
  );
};

export default MyTeams;

