import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider'; // <-- Make sure this path is correct
import './Login.css';

// Optional: for a nice Google icon
// Install with: npm install react-icons
// import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  // 1. Get auth state and functions from our hook
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // 2. Handle redirect if user is already logged in
  useEffect(() => {
    // As soon as loading is false and we see a user,
    // they are logged in. Redirect them away from the login page.
    if (!loading && user) {
      navigate('/dashboard'); // <-- Change '/dashboard' to your main app page
    }
  }, [user, loading, navigate]);

  // 3. Show loading spinner while checking auth
  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  // 4. Handle the Google sign-in click
  const handleLogin = async () => {
    try {
      // This function is from our AuthProvider, it handles everything
      await signInWithGoogle();
      // The useEffect above will catch the new 'user' state and redirect
    } catch (error) {
      console.error("Failed to sign in with Google", error);
    }
  };

  return (
    <div>
      <div className="login-page">
        <div className="auth-main">
          <div className="auth-card">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">Sign in to continue</p>
            <button 
              onClick={handleLogin}
              className="btn auth-submit google-btn" 
            >
              Login with Google
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;