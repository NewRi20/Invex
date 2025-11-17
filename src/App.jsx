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

// 2. Create your "Protected Route" component
// This component checks if the user is logged in.
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner or blank page while checking auth
    return <div>Loading...</div>;
  }

  if (!user) {
    // If not logged in, redirect them to the /login page
    return <Navigate to="/login" replace />;
  }

  // If they are logged in, show the page they requested
  // <Outlet> renders the child route (e.g., <Dashboard />)
  return <Outlet />;
};


function App() {
  // 3. We removed all the old 'axios' and 'useState' code
  // Your AuthProvider now handles all user data!

  return (
    <Router>
      <Routes>
        {/* === PUBLIC ROUTE === */}
        {/* Everyone can see the login page */}
        <Route path="/login" element={<Login />} />

        {/* === PROTECTED ROUTES === */}
        {/* This <Route> acts as a wrapper.
            It renders <ProtectedRoute />, which then decides
            to show the page or redirect to /login.
        */}
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