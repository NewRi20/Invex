import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { Edit } from 'lucide-react';
import './Profile.css';


import BusinessProfileEdit from '../EditProfile/Business/BusinessProfileEdit.jsx';
import OwnerProfileEdit from '../EditProfile/Owner/OwnerBusinessInfo.jsx';

const Profile = () => {

  const [BusinessInfo, setBusinessInfo] = useState([
    { name: '',
      address: '',
      started: '' 
    }
  ]);


  // Check if BusinessInfo has valid data (non-empty values)
  const hasValidBusinessInfo = BusinessInfo.some(info => 
    info.name?.trim() || info.address?.trim() || info.started?.trim()
  );

  const [editTab, setEditTab] = useState(null);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    name: '',
    address: '',
    started: ''
  });

  const handleEditCardClick = (key) => {
    setEditTab(key);
  }

  const handleBusinessFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleBusinessFormSubmit = (e) => {
    e.preventDefault();
    // Update BusinessInfo with the form data
    setBusinessInfo([businessFormData]);
    console.log('Business Info submitted:', businessFormData);
    setShowBusinessForm(false);
  }

  const handleBusinessFormCancel = () => {
    setShowBusinessForm(false);
    setBusinessFormData({ name: '', address: '', started: '' });
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

          {/* Renders Business Information if there is valid data */}
          {hasValidBusinessInfo ? 
            (<div>
              {BusinessInfo.map((info, index) => (
                <div key={index} className="profile-field-group">
                  <div className="profile-field-title">{info.name}</div>
                  <div className="profile-field-subtext">{info.address}</div>
                  <div className="profile-muted">Started in {info.started}</div>
                </div>
              ))}
              </div>) : showBusinessForm ? (
          
                /* Business Information Form */
                <form className="business-info-form" onSubmit={handleBusinessFormSubmit}>
                  <div className="form-field">
                    <label className="form-label">Business Name:</label>
                    <input
                      type="text"
                      name="name"
                      className="input form-input"
                      placeholder="Enter business name"
                      value={businessFormData.name}
                      onChange={handleBusinessFormChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Business Address:</label>
                    <input
                      type="text"
                      name="address"
                      className="input form-input"
                      placeholder="Enter business address"
                      value={businessFormData.address}
                      onChange={handleBusinessFormChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Date Started:</label>
                    <input
                      type="date"
                      name="started"
                      className="input form-input"
                      value={businessFormData.started}
                      onChange={handleBusinessFormChange}
                      required
                    />
                  </div>

                  <div className="form-buttons">
                    <button type="submit" className="btn btn-small form-btn-save">
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-small form-btn-cancel"
                      onClick={handleBusinessFormCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
              <div 
                className='addBusinessInfo-Btn' 
                role='button'
                onClick={() => setShowBusinessForm(true)}
              >
                <p>Add Business Information</p>
              </div>
          )}




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
