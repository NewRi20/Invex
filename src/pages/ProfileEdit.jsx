import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const ProfileEdit = () => {
  return (
    <Layout title="Profile - Edit Page">
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

      {/* Business Information */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)"
        }}
      >
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          marginBottom: "20px" 
        }}>
          Business Information
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Name of the business:
          </label>
          <input
            type="text"
            className="input"
            defaultValue="FRONDA MINI HARDWARE STORE"
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Business Address:
          </label>
          <input
            type="text"
            className="input"
            defaultValue="Blk-33 Lot 1 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Year started:
          </label>
          <input
            type="date"
            className="input"
            defaultValue="2021-10-01"
          />
        </div>

        <div className="flex-end gap-2">
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--light-peach)", 
              color: "var(--text-dark)"
            }}
          >
            Create
          </button>
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--light-peach)", 
              color: "var(--text-dark)"
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Business Owner Information */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)"
        }}
      >
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          marginBottom: "20px" 
        }}>
          Business Owner Information
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Name of Owner:
          </label>
          <input
            type="text"
            className="input"
            defaultValue="Marlene Fronde"
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Owner Address:
          </label>
          <input
            type="text"
            className="input"
            defaultValue="Block 52A Lot 6 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal"
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Owner Birthday:
          </label>
          <input
            type="date"
            className="input"
            defaultValue="1984-05-09"
          />
        </div>

        <div className="flex-end gap-2">
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--light-peach)", 
              color: "var(--text-dark)"
            }}
          >
            Create
          </button>
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--light-peach)", 
              color: "var(--text-dark)"
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex-center">
        <Link 
          to="/login"
          className="btn"
          style={{ 
            backgroundColor: "var(--light-peach)", 
            color: "var(--text-dark)",
            padding: "12px 24px"
          }}
        >
          Logout
        </Link>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
