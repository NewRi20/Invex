import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 1. Import your Auth hook
import { useAuth } from './AuthProvider'; // <-- Make sure path is correct

// Import your page components
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import Pricing from './pages/Pricing/Pricing';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile/Profile';
import Login from './pages/Login/Login';


const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};


function App() {

  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTE === */}
        {/* Everyone can see the login page */}
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory/*" element={<Inventory />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* All default/fallback routes are now also protected */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;