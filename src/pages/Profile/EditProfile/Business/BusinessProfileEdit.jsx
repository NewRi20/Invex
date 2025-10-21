import React from 'react';
import './BusinessProfileEdit.css';

const OwnerProfileEdit = () => {
  return (
    <>
      {/* Business Information */}
      <div className="profileedit-card">
        <h3 className="profileedit-section-title">
          Business Information
        </h3>

        <div className="profileedit-field">
          <label className="profileedit-label">
            Name of the business:
          </label>
          <input
            type="text"
            className="input"
            placeholder="Enter Business Name Here"
          />
        </div>

        <div className="profileedit-field">
          <label className="profileedit-label">
            Business Address:
          </label>
          <input
            type="text"
            className="input"
            placeholder="Enter Business Address Here"
          />
        </div>

        <div className="profileedit-field-last">
          <label className="profileedit-label">
            Year started:
          </label>
          <input
            type="date"
            className="input"
          />
        </div>

        <div className="profileedit-buttons">
          <button className="profileedit-btn">
            Create
          </button>
          <button className="profileedit-btn">
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default OwnerProfileEdit;
