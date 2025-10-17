import React from 'react';
import { Link } from 'react-router-dom';
import { User, Facebook, Linkedin } from 'lucide-react';

const Login = () => {
  return (
    <div>
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
            Login
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
            backgroundColor: "#E8C4B8", 
            borderRadius: "12px", 
            padding: "40px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 style={{ 
              fontSize: "28px", 
              fontWeight: "bold", 
              color: "var(--text-dark)",
              textAlign: "center",
              marginBottom: "8px"
            }}>
              Login
            </h2>
            
            <p style={{ 
              fontSize: "16px", 
              color: "var(--text-dark)", 
              textAlign: "center",
              marginBottom: "32px"
            }}>
              Welcome back!
            </p>

            <form>
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input"
                  style={{ 
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-dark)"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <input
                  type="password"
                  placeholder="Password"
                  className="input"
                  style={{ 
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-dark)"
                  }}
                />
              </div>

              <div style={{ 
                textAlign: "right", 
                marginBottom: "24px" 
              }}>
                <a 
                  href="#" 
                  style={{ 
                    color: "var(--text-dark)", 
                    fontSize: "14px",
                    textDecoration: "none"
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <button 
                type="submit"
                className="btn"
                style={{ 
                  width: "100%",
                  backgroundColor: "#3D3D3D",
                  color: "var(--white)",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "20px"
                }}
              >
                Login
              </button>

              <div style={{ textAlign: "center" }}>
                <span style={{ 
                  color: "var(--text-dark)", 
                  fontSize: "14px" 
                }}>
                  Don't have an account?{" "}
                </span>
                <Link 
                  to="/signup"
                  style={{ 
                    color: "var(--text-dark)", 
                    fontSize: "14px",
                    fontWeight: "500",
                    textDecoration: "none"
                  }}
                >
                  Sign Up
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
            Developed by Inven Fonda
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Facebook size={16} color="var(--white)" />
            <Linkedin size={16} color="var(--white)" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
