import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#0A0B0D',
      color: 'white',
      padding: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1>🚀 Test Page Working!</h1>
      <p>If you can see this, the app is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          background: '#3B82F6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Go to Main App
      </button>
    </div>
  );
};

export default TestPage; 