import React from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  return (
    <div>
      <div className="login-page">

        {/* Main Content */}
        <div className="auth-main">
          <div className="auth-card">
            <h2 className="auth-title">Login</h2>
            
            <p className="auth-subtitle">Welcome back!</p>

            <form>
              <div className="auth-group auth-group--lg">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input"
                />
              </div>

              <div className="auth-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="input"
                />
              </div>

              <div className="auth-forgot">
                <a href="#" className="auth-link">
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit"
                className="btn auth-submit"
              >
                Login
              </button>

              <div className="auth-switch">
                <span className="auth-switch-text">
                  Don't have an account?{" "}
                </span>
                <Link 
                  to="/signup"
                  className="auth-switch-link"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Login;
