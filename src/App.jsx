import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/admin-tadbeer" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
