import React from 'react';
import './OwnerBusinessInfo.css';

const BusinessEdit = () => {
  return (
    <>
        {/* Business Owner Information */}
      <div className="profileedit-card">
        <h3 className="profileedit-section-title">
          Business Owner Information
        </h3>

        <div className="profileedit-field">
          <label className="profileedit-label">
            Name of Owner:
          </label>
          <input
            type="text"
            className="input"
            placeholder="Marlene Fronde"
          />
        </div>

        <div className="profileedit-field">
          <label className="profileedit-label">
            Owner Address:
          </label>
          <input
            type="text"
            className="input"
            placeholder="Block 52A Lot 6 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal"
          />
        </div>

        <div className="profileedit-field-last">
          <label className="profileedit-label">
            Owner Birthday:
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
  )

}

export default BusinessEdit;