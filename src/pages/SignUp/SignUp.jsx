import React from 'react';
import { Link } from 'react-router-dom';
import { User, Facebook, Linkedin } from 'lucide-react';
import './SignUp.css';

const SignUp = () => {
  return (
    <div className="signup-page">

      {/* Main Content */}
      <div className="auth-main">

        <div className="signup-card">
          <h2 className="auth-title">Sign Up</h2>
          <p className="auth-subtitle signup-subtitle">Please enter your information to create an account</p>

          <form>
            <div className="auth-grid">
              <input
                type="text"
                placeholder="First Name"
                className="input"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input"
              />
            </div>

            <div className="auth-grid">
              <input
                type="email"
                placeholder="Email"
                className="input"
              />
              <input
                type="date"
                placeholder="Birthday"
                className="input-date"
              />
            </div>

            <div className="auth-grid auth-grid--mb24">
              <input
                type="password"
                placeholder="Password"
                className="input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="input"
              />
            </div>

            <div className='homeAddressContainer'>
              <input
                type="text"
                placeholder="Home Address"
                className="input"
              />
            </div>              

            <button 
              type="submit"
              className="auth-submit"
            >
              Sign Up
            </button>

            <div className="auth-switch">
              <span className="auth-switch-text">
                Already have an account?{" "}
              </span>
              <Link 
                to="/login"
                className="auth-switch-link"
              >
                Log In
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default SignUp;
