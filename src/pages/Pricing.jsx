import React from 'react';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';

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
      {/* Section Header */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Pricing</h2>
      </div>

      <div className="grid grid-2">
        {/* Pricing List */}
        <div 
          className="card"
          style={{ 
            backgroundColor: "var(--light-card-bg)", 
            color: "var(--text-dark)"
          }}
        >
          <h3 style={{ 
            fontSize: "16px", 
            marginBottom: "16px", 
            fontWeight: "600" 
          }}>
            Pricing List
          </h3>
          
          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search"
              className="input"
              style={{ paddingRight: "40px" }}
            />
            <Search 
              size={20} 
              style={{ 
                position: "absolute", 
                right: "12px", 
                top: "50%", 
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }} 
            />
          </div>

          {/* Table Headers */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr", 
            marginBottom: "12px",
            fontWeight: "600",
            fontSize: "14px"
          }}>
            <div>Name</div>
            <div style={{ textAlign: "center" }}>Prices per piece</div>
            <div style={{ textAlign: "right" }}>Update Date</div>
          </div>

          {/* Table Data */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pricingData.map((item, index) => (
              <div 
                key={index}
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "8px 0",
                  borderBottom: "1px solid #E0E0E0"
                }}
              >
                <div>{item.name}</div>
                <div style={{ textAlign: "center" }}>{item.price}</div>
                <div style={{ textAlign: "right" }}>{item.updateDate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Details */}
        <div 
          className="card"
          style={{ 
            backgroundColor: "var(--light-card-bg)", 
            color: "var(--text-dark)"
          }}
        >
          <h3 style={{ 
            fontSize: "16px", 
            marginBottom: "20px", 
            fontWeight: "600" 
          }}>
            Pricing Details
          </h3>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500" 
            }}>
              Product's Name
            </label>
            <div style={{ 
              padding: "12px", 
              backgroundColor: "var(--input-bg)", 
              borderRadius: "var(--border-radius)",
              fontSize: "14px"
            }}>
              4 Blades Clip Fan
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500" 
            }}>
              Previous Price
            </label>
            <div style={{ 
              padding: "12px", 
              backgroundColor: "var(--input-bg)", 
              borderRadius: "var(--border-radius)",
              fontSize: "14px"
            }}>
              180
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500" 
            }}>
              New Price
            </label>
            <input
              type="text"
              defaultValue="180"
              className="input"
              style={{ marginBottom: "0" }}
            />
          </div>

          <div className="flex-center">
            <button className="btn btn-primary">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
