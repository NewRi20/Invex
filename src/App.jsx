import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Pricing from './pages/Pricing/Pricing';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile/Profile';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import axios from 'axios';

function App() {
  const [arrayUsers, setArrayUsers] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get('http://127.0.0.1:8080/api/users');
    setArrayUsers(response.data.users);
  }

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory/*" element={<Inventory />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reports/*" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>

  );
}

export default App;