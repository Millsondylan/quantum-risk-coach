import React from 'react';

const SimpleTest = () => {
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
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🚀 Simple Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <p>User Agent: {navigator.userAgent}</p>
      <button 
        onClick={() => alert('Button works!')}
        style={{
          background: '#3B82F6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default SimpleTest; 