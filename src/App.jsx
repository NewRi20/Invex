import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Pricing from './pages/Pricing/Pricing';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;