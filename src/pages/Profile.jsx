import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';

const Profile = () => {
  return (
    <Layout title="Profile - Main">
      {/* Section Header */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Profile</h2>
      </div>

      <div className="grid grid-2">
        {/* Business Information */}
        <div 
          className="card"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            color: "var(--white)",
            position: "relative"
          }}
        >
          <div className="flex-between mb-3">
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "bold" 
            }}>
              Business Information
            </h3>
            <Link 
              to="/profile/edit"
              className="btn btn-small"
              style={{ 
                backgroundColor: "#F0A0A0", 
                color: "var(--white)",
                padding: "6px 12px",
                fontSize: "12px"
              }}
            >
              <Edit size={14} style={{ marginRight: "4px" }} />
              Edit
            </Link>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "8px" 
            }}>
              FRONDA MINI HARDWARE STORE
            </div>
            <div style={{ 
              fontSize: "14px", 
              opacity: 0.9,
              lineHeight: "1.4"
            }}>
              Blk-33 Lot 1 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal
            </div>
          </div>

          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            Started in October 2021
          </div>
        </div>

        {/* Business Owner Information */}
        <div 
          className="card"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            color: "var(--white)",
            position: "relative"
          }}
        >
          <div className="flex-between mb-3">
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "bold" 
            }}>
              Business Owner Information
            </h3>
            <Link 
              to="/profile/edit"
              className="btn btn-small"
              style={{ 
                backgroundColor: "#F0A0A0", 
                color: "var(--white)",
                padding: "6px 12px",
                fontSize: "12px"
              }}
            >
              <Edit size={14} style={{ marginRight: "4px" }} />
              Edit
            </Link>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "8px" 
            }}>
              Marlene Fronde
            </div>
            <div style={{ 
              fontSize: "14px", 
              opacity: 0.9,
              lineHeight: "1.4"
            }}>
              Block 52A Lot 6 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal
            </div>
          </div>

          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            May 9, 1984
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
