import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider'; // <-- Make sure this path is correct
import './Login.css';


const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); 
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in with Google", error);
    }
  };

  return (
    <div>
      <div className="login-page">
        <div className="auth-main">
          <div className="auth-card">
            <h2 className="auth-title">Invex</h2>
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