import React from 'react';

const FallbackApp: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#0A0B0D',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀 Quantum Risk Coach</h1>
      <p style={{ fontSize: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
        Next-Gen Trading Intelligence
      </p>
      <div style={{ 
        background: '#1A1B1E', 
        padding: '20px', 
        borderRadius: '10px',
        border: '1px solid #2A2B2E',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>App Status</h2>
        <div style={{ marginBottom: '0.5rem' }}>
          ✅ React App Loaded
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          ✅ Fallback Component Rendered
        </div>
        <div style={{ marginBottom: '1rem' }}>
          ✅ CSS Styles Applied
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Reload App
        </button>
      </div>
    </div>
  );
};

export default FallbackApp; 