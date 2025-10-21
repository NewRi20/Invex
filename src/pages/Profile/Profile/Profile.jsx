import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Edit } from 'lucide-react';
import './Profile.css';


import BusinessProfileEdit from '../EditProfile/Business/BusinessProfileEdit.jsx';
import OwnerProfileEdit from '../EditProfile/Owner/OwnerBusinessInfo.jsx';

const Profile = () => {
  const [editTab, setEditTab] = useState(null);

  const handleEditCardClick = (key) => {
    setEditTab(key);
  }

  return (
    <Layout title="Profile">

      <div className="profile-container">
        {/* Business Information */}
        <div className="business-profile-card">
          <div className="profile-section-title-container">
            <h3 className="profile-section-title">
              Business Information
            </h3>
            <button 
              className="profile-edit-btn"
              onClick={() => handleEditCardClick('business-profile')}
            >
              <Edit size={14} className="profile-edit-icon" />
              Edit
            </button>
          </div>

          <div className="profile-field-group">
            <div className="profile-field-title">
              FRONDA MINI HARDWARE STORE
            </div>
            <div className="profile-field-subtext">
              Blk-33 Lot 1 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal
            </div>

            <div className="profile-muted">
              Started in October 2021
            </div>
          </div>

        </div>

        {/* Business Owner Information */}
        <div className="owner-profile-card">
          <div className="profile-section-title-container">
            <h3 className="profile-section-title">
              Business Owner Information
            </h3>
            <button 
              className="profile-edit-btn"
              onClick={() => handleEditCardClick('owner-profile')}
            >
              <Edit size={14} className="profile-edit-icon" />
              Edit
            </button>
          </div>

          <div className="profile-field-group">
            <div className="profile-field-title">
              Marlene Fronde
            </div>
            <div className="profile-field-subtext">
              Block 52A Lot 6 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal
            </div>

            <div className="profile-muted">
              May 9, 1984
            </div>
          </div>

          {/* Logout Button */}
          <div className="profileedit-logout-container">
            <Link 
              to="/signup"
              className="btn profileedit-logout-btn"
            >
              Logout
            </Link>
          </div>
          
        </div>
      </div>

      <div className="profile-edit-container">
        {editTab === 'business-profile' && <BusinessProfileEdit />}
        {editTab === 'owner-profile' && <OwnerProfileEdit />}
      </div>


    </Layout>
  );
};

export default Profile;
