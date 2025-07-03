import React from 'react';

interface DebugInfoProps {
  user: any;
  isLoading: boolean;
  error: string | null;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ user, isLoading, error }) => {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>User: {user ? 'Exists' : 'None'}</div>
      <div>Error: {error || 'None'}</div>
      <div>User ID: {user?.id || 'N/A'}</div>
      <div>Onboarding: {user?.onboardingCompleted ? 'Complete' : 'Incomplete'}</div>
    </div>
  );
};

export default DebugInfo; 