import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SimpleTest from './SimpleTest';
import ComprehensiveTestRunner from '../COMPREHENSIVE_TEST_RUNNER';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* <SimpleTest /> */}
    <ComprehensiveTestRunner />
  </React.StrictMode>
);
