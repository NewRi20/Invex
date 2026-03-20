import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Layout from '../../../components/Layout';
import { Edit } from 'lucide-react';

// 1. Import your Auth hook
import { useAuth } from '../../../AuthProvider';
import { API_BASE_URL } from '../../../config';

// Removed imports for BusinessProfileEdit and OwnerProfileEdit
// as we'll handle the edit logic inline.

const Profile = () => {
  // 2. Get real data and functions from AuthProvider
  const { profile, session, signOut } = useAuth();
  const navigate = useNavigate();

  // --- State for Business Owner Info ---
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [ownerFormData, setOwnerFormData] = useState({
    first_name: '',
    last_name: '',
    home_address: '',
    birthday: '',
  });

  // --- State for Business Info (left as-is from your code) ---
  const [BusinessInfo, setBusinessInfo] = useState(null);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [businessFormData, setBusinessFormData] = useState({
    name: '', address: '', started: ''
  });

  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);

  // 3. Populate Owner form data when the profile loads
  useEffect(() => {
    if (profile) {
      setOwnerFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        home_address: profile.home_address || '',
        birthday: profile.birthday || '',
      });
    }
  }, [profile]); // This runs when 'profile' changes

  useEffect(() => {
    if (session) {
      const fetchBusinessInfo = async () => {
        setIsLoadingBusiness(true);
        try {
          const response = await fetch(`${API_BASE_URL}/business/me`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Business API failed with status ${response.status}`);
          }
                 
          const data = await response.json();
          
          if (data) { // Check if data is not null
            setBusinessInfo(data);
            // Pre-fill the form with the loaded data
            setBusinessFormData({
              name: data.business_name || '',
              address: data.business_address || '',
              started: data.year_founded || ''
            });
          }
        } catch (error) {
          console.error(error.message);
        } finally {
          setIsLoadingBusiness(false);
        }
      };
      fetchBusinessInfo();
    }
  }, [session]);


  // Handle changes to the owner's edit form
  const handleOwnerFormChange = (e) => {
    const { name, value } = e.target;
    setOwnerFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 5. Handle submission of the owner's edit form
  const handleOwnerFormSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("You are not logged in.");
      return;
    }

    try {
      // Call your Flask backend's PUT /api/users/me endpoint
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(ownerFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Success!
      alert('Profile updated successfully!');
      setIsEditingOwner(false);
      // Reload the page to force AuthProvider to refetch the new profile
      window.location.reload(); 

    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // 6. Handle canceling the owner's edit
  const handleOwnerFormCancel = () => {
    setIsEditingOwner(false);
    // Reset form to its original state from the profile
    if (profile) {
      setOwnerFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        home_address: profile.home_address || '',
        birthday: profile.birthday || '',
      });
    }
  };

  // 7. A real logout handler
  const handleLogout = () => {
    signOut();
    navigate('/login'); 
  };

  // --- Handlers for Business Info (unchanged) ---
  const handleBusinessFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessFormSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("You are not logged in.");
      return;
    }

    try {
      // Call our new PUT /api/business/me endpoint
      const response = await fetch(`${API_BASE_URL}/business/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        // Send the form data (name, address, started)
        body: JSON.stringify(businessFormData), 
      });

      if (!response.ok) {
        throw new Error('Failed to update business info');
      }

      alert('Business info updated!');
      setIsEditingBusiness(false);
      window.location.reload(); // Easiest way to refetch all data

    } catch (error) {
      console.error('Error updating business info:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleBusinessFormCancel = () => {
    setIsEditingBusiness(false);
    // Reset form to the last loaded data
    if (BusinessInfo) {
      setBusinessFormData({
        name: BusinessInfo.business_name || '',
        address: BusinessInfo.business_address || '',
        started: BusinessInfo.year_founded || ''
      });
    }
  };


  if (!profile || isLoadingBusiness) {
    return (
      <Layout title="Profile">
        <div>Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">

        {/* --- Business Information Card (UPDATED) --- */}
        <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 mb-5 rounded-[20px] flex flex-col md:p-4">
          <div className="flex flex-row justify-between items-center bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 mb-1 rounded-[20px] md:p-[14px]">
            <h3 className="text-lg font-bold md:text-base">Business Information</h3>
            {/* Show Edit button ONLY if not editing AND data exists */}
            {!isEditingBusiness && BusinessInfo && (
              <button 
                className="bg-[var(--secondary-bg)] text-[var(--primary-bg)] px-3 py-1.5 text-xs flex items-center rounded-lg border-none cursor-pointer md:px-[10px] md:py-2 md:text-[12px]"
                onClick={() => setIsEditingBusiness(true)} 
              >
                <Edit size={14} className="mr-1" />
                Edit
              </button>
            )}
          </div>

          {/* This logic now shows Form, Display, or "Add" button */}
          {isEditingBusiness ? (
            /* --- Business Edit Form --- */
            <form className="p-5 bg-[var(--panel-bg)] rounded-[10px]" onSubmit={handleBusinessFormSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Business Name:</label>
                <input
                  type="text"
                  name="name" // Matches state: businessFormData.name
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  placeholder="Enter business name"
                  value={businessFormData.name}
                  onChange={handleBusinessFormChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Business Address:</label>
                <input
                  type="text"
                  name="address" // Matches state: businessFormData.address
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  placeholder="Enter business address"
                  value={businessFormData.address}
                  onChange={handleBusinessFormChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Date Started:</label>
                <input
                  type="date"
                  name="started" // Matches state: businessFormData.started
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  value={businessFormData.started}
                  onChange={handleBusinessFormChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="submit" className="px-4 py-2 text-sm rounded bg-[var(--Btn-bg-blue)] text-[var(--primary-bg)] hover:bg-[var(--Btn-bg-blue-light)]">Save</button>
                <button type="button" className="px-4 py-2 text-sm rounded bg-[var(--Btn-bg-blue)] text-[var(--primary-bg)] hover:opacity-80" onClick={handleBusinessFormCancel}>Cancel</button>
              </div>
            </form>
          ) : BusinessInfo ? (
            /* --- Business Display Info (Data exists) --- */
            <div className="p-5 mb-0 rounded-[20px] md:p-3">
              {/* Note: We use the DB column names here */}
              <div className="text-base font-semibold mb-2">{BusinessInfo.business_name}</div>
              <div className="mt-4 text-sm opacity-90 leading-[1.4] [&>em]:italic [&>em]:opacity-70">{BusinessInfo.business_address}</div>
              <div className="text-sm opacity-90 mt-1.5 [&>em]:italic [&>em]:opacity-70">Started in {BusinessInfo.year_founded}</div>
            </div>
          ) : (
            /* --- "Add Info" Button (No data exists) --- */
            <div 
              className='bg-[var(--Btn-bg-blue)] hover:bg-[var(--Btn-bg-blue-light)] text-[var(--white-blue-text)] p-2.5 m-1.5 text-xs flex items-center justify-center rounded-[10px] border-none no-underline cursor-pointer md:p-3 md:text-[13px]' 
              role='button'
              onClick={() => setIsEditingBusiness(true)} // Just open the form
            >
              <p>Add Business Information</p>
            </div>
          )}
        </div>

        {/* Business Owner Information (Now dynamic) */}
        <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 mb-5 rounded-[20px] flex flex-col md:p-4">
          <div className="flex flex-row justify-between items-center bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 mb-1 rounded-[20px] md:p-[14px]">
            <h3 className="text-lg font-bold md:text-base">
              Business Owner Information
            </h3>
            {/* 8. Hide Edit button when already editing */}
            {!isEditingOwner && (
              <button 
                className="bg-[var(--secondary-bg)] text-[var(--primary-bg)] px-3 py-1.5 text-xs flex items-center rounded-lg border-none cursor-pointer md:px-[10px] md:py-2 md:text-[12px]"
                onClick={() => setIsEditingOwner(true)}
              >
                <Edit size={14} className="mr-1" />
                Edit
              </button>
            )}
          </div>

          {/* 9. Show edit form or display info */}
          {isEditingOwner ? (
            /* --- Owner Edit Form --- */
            <form className="p-5 bg-[var(--panel-bg)] rounded-[10px]" onSubmit={handleOwnerFormSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">First Name:</label>
                <input
                  type="text"
                  name="first_name"
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  value={ownerFormData.first_name}
                  onChange={handleOwnerFormChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Last Name:</label>
                <input
                  type="text"
                  name="last_name"
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  value={ownerFormData.last_name}
                  onChange={handleOwnerFormChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Home Address:</label>
                <input
                  type="text"
                  name="home_address"
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  placeholder="Enter your address"
                  value={ownerFormData.home_address}
                  onChange={handleOwnerFormChange}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-[var(--primary-bg)]">Birthday:</label>
                <input
                  type="date"
                  name="birthday"
                  className="w-full border border-[var(--primary-bg)] p-2.5 rounded-[10px] bg-[var(--card-bg)] text-[var(--primary-bg)] transition-colors duration-200 ease-in-out placeholder:text-[var(--primary-bg)] placeholder:opacity-50 focus:outline-none focus:border-[var(--primary-bg-light)] focus:bg-[var(--primary-bg-light)] focus:text-[var(--white-blue-text)]"
                  value={ownerFormData.birthday}
                  onChange={handleOwnerFormChange}
                />
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="submit" className="px-4 py-2 text-sm rounded bg-[var(--Btn-bg-blue)] text-[var(--primary-bg)] hover:bg-[var(--Btn-bg-blue-light)]">
                  Save
                </button>
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm rounded bg-[var(--Btn-bg-blue)] text-[var(--primary-bg)] hover:opacity-80"
                  onClick={handleOwnerFormCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* --- Owner Display Info --- */
            <div className="p-5 mb-0 rounded-[20px] md:p-3">
              <div className="text-base font-semibold mb-2">
                {profile.first_name} {profile.last_name}
              </div>
              <div className="mt-4 text-sm opacity-90 leading-[1.4] [&>em]:italic [&>em]:opacity-70">
                {profile.home_address || <em>No address provided</em>}
              </div>
              <div className="text-sm opacity-90 mt-1.5 [&>em]:italic [&>em]:opacity-70">
                {profile.birthday || <em>No birthday provided</em>}
              </div>
            </div>
          )}

          {/* 10. Fixed Logout Button */}
          <div className="mt-auto pt-5 border-t border-[var(--secondary-bg)] mx-5 md:mx-0 md:pt-3">
            <button 
              onClick={handleLogout}
              className="w-full border-none rounded-[10px] cursor-pointer bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] p-2.5 text-sm font-bold text-center transition-opacity duration-200 hover:opacity-80"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;