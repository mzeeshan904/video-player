import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      fontSize: '24px', 
      color: 'white', 
      backgroundColor: '#333',
      textAlign: 'center'
    }}>
      <h1>✅ REACT IS WORKING!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Timestamp: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default SimpleTest;
