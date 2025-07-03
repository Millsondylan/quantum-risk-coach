import React from 'react';

const MinimalTest = () => {
  React.useEffect(() => {
    console.log('🔍 MinimalTest component mounted');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
      color: '#fff',
      padding: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px'
    }}>
      <h1>🚀 Minimal Test</h1>
      <p>React is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <button 
        onClick={() => {
          console.log('🔍 Button clicked');
          alert('Button works!');
        }}
        style={{
          background: '#fff',
          color: '#000',
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

export default MinimalTest; 