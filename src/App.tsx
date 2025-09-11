import React from 'react';

// Simple test component first
const DemoApp: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      padding: '20px',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)', 
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px'
      }}>
        ✅ React App Working!
      </h1>
      
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        border: '2px solid #4caf50',
        borderRadius: '12px',
        padding: '30px',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#4caf50', marginBottom: '15px' }}>
          🎉 Success!
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          React component is now rendering properly!
        </p>
        <p style={{ opacity: 0.8 }}>
          This proves the React Scripts setup is working.
          <br/>
          Next step: Add the media player component.
        </p>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', opacity: 0.7 }}>
          🚀 Custom Media Player - Source Code Test
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>
          No more "Unexpected token" or locatorjs errors!
        </p>
      </div>
    </div>
  );
};

export default DemoApp;