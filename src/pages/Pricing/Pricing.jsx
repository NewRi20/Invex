import React from 'react';
import Layout from '../../components/Layout';
import { Search } from 'lucide-react';
import './Pricing.css';

const Pricing = () => {
  const pricingData = [
    {
      name: "4 Blades Clip Fan",
      price: "180",
      updateDate: "19/03/2025"
    },
    {
      name: "4 Blades Clip Fan",
      price: "180",
      updateDate: "19/03/2025"
    }
  ];

  return (
    <Layout title="Pricing">
      <div className="pricing-page">
        {/* Section Header */}
        <div className="pricing-header">
          <h2 className="pricing-title">Pricing</h2>
        </div>

        <div className="grid grid-2">
          {/* Pricing List */}
          <div className="pricing-card">
            <h3 className="section-title">Pricing List</h3>

            {/* Search Bar */}
            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
              <Search className="search-icon" />
            </div>

            {/* Table Headers */}
            <div className="pricing-header-row">
              <div>Name</div>
              <div className="text-center">Prices per piece</div>
              <div className="text-right">Update Date</div>
            </div>

            {/* Table Data */}
            <div className="pricing-list">
              {pricingData.map((item, index) => (
                <div key={index} className="pricing-row">
                  <div>{item.name}</div>
                  <div className="text-center">{item.price}</div>
                  <div className="text-right">{item.updateDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="pricing-card">
            <h3 className="section-title">
              Pricing Details
            </h3>

            <div className="form-group">
              <label className="label">
                Product's Name:
              </label>
              <div className="readonly-field">
                4 Blades Clip Fan
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Previous Price:
              </label>
              <div className="readonly-field">
                180
              </div>
            </div>

            <div className="form-group form-group-lg">
              <label className="label">
                New Price:
              </label>
              <input
                type="text"
                defaultValue="180"
                className="inputNewPrice"
              />
            </div>

            
            <button className="confirm-Btn">
              Confirm
            </button>
            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
