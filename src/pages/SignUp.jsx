import React from 'react';
import { Link } from 'react-router-dom';
import { User, Facebook, Linkedin } from 'lucide-react';

const SignUp = () => {
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#4A4A4A",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: "#666666", 
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ 
          color: "var(--white)", 
          fontSize: "18px", 
          fontWeight: "bold" 
        }}>
          sign up
        </h1>
        <div style={{ color: "var(--white)" }}>
          <User size={20} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{ 
          backgroundColor: "#E8CFC7", 
          borderRadius: "12px", 
          padding: "40px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ 
            fontSize: "28px", 
            fontWeight: "bold", 
            color: "var(--text-dark)",
            textAlign: "center",
            marginBottom: "8px"
          }}>
            Sign Up
          </h2>
          
          <p style={{ 
            fontSize: "14px", 
            color: "var(--text-dark)", 
            textAlign: "center",
            marginBottom: "32px"
          }}>
            Please enter your information to create an account
          </p>

          <form>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "16px",
              marginBottom: "16px"
            }}>
              <input
                type="text"
                placeholder="First Name"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "16px",
              marginBottom: "16px"
            }}>
              <input
                type="email"
                placeholder="Email"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
              <input
                type="date"
                placeholder="Birthday"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
            </div>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "16px",
              marginBottom: "24px"
            }}>
              <input
                type="password"
                placeholder="Password"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="input"
                style={{ 
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-dark)",
                  marginBottom: "0"
                }}
              />
            </div>

            <button 
              type="submit"
              className="btn"
              style={{ 
                width: "100%",
                backgroundColor: "#5C5C5C",
                color: "var(--white)",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "20px"
              }}
            >
              Sign Up
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ 
                color: "var(--text-dark)", 
                fontSize: "14px" 
              }}>
                Already have an account?{" "}
              </span>
              <Link 
                to="/login"
                style={{ 
                  color: "var(--text-dark)", 
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none"
                }}
              >
                Log In
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: "#666666", 
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <p style={{ 
          color: "var(--white)", 
          fontSize: "12px" 
        }}>
          Developed by Ines Franda
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Linkedin size={16} color="var(--text-dark)" />
          <Facebook size={16} color="var(--text-dark)" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
