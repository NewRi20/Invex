import { Search, TrendingUp, ChevronDown } from 'lucide-react';
import React from 'react';

const ReportsSalesRevenue = () => {
  const topItems = [
    { rank: 1, name: "Item name", unitSold: "Unit Sold", revenue: "Revenue" },
    { rank: 2, name: "Item name", unitSold: "Unit Sold", revenue: "Revenue" },
    { rank: 3, name: "Item name", unitSold: "Unit Sold", revenue: "Revenue" },
    { rank: 4, name: "Item name", unitSold: "Unit Sold", revenue: "Revenue" },
    { rank: 5, name: "Item name", unitSold: "Unit Sold", revenue: "Revenue" }
  ];

  const topCategories = [
    { rank: 1, name: "Category Name", unitSold: "Unit Sold", revenue: "Revenue" }
  ];

  return (
    <>
      {/* Section Header */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Reports</h2>
      </div>

      <div 
        className="card"
        style={{ 
          backgroundColor: "var(--card-bg)", 
          color: "var(--white)"
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          Sales & Revenue
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "24px", opacity: 0.8 }}>
          Sales Daily Report
        </p>

        {/* Report Display Area */}
        <div 
          style={{ 
            backgroundColor: "var(--white)", 
            height: "300px", 
            borderRadius: "var(--border-radius)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)"
          }}
        >
          Report Display Area
        </div>

        {/* Input Row */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Item code"
            className="input"
            style={{ flex: 1, marginBottom: "0" }}
          />
          <input
            type="text"
            placeholder="Quantity"
            className="input"
            style={{ flex: 1, marginBottom: "0" }}
          />
          <button className="btn btn-secondary">
            Sold
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-2 mb-4">
          <div 
            className="card"
            style={{ 
              backgroundColor: "var(--light-card-bg)", 
              color: "var(--text-dark)",
              marginBottom: "0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>210</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>Items sold</div>
          </div>

          <div 
            className="card"
            style={{ 
              backgroundColor: "var(--light-card-bg)", 
              color: "var(--text-dark)",
              marginBottom: "0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>2500</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>Total Revenue</div>
          </div>
        </div>

        {/* Dropdown */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: "var(--light-card-bg)",
            borderRadius: "var(--border-radius)",
            cursor: "pointer"
          }}>
            <span style={{ color: "var(--text-dark)", fontSize: "14px" }}>Month</span>
            <ChevronDown size={16} color="var(--text-dark)" />
          </div>
        </div>

        {/* Top Item List */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "bold", 
            marginBottom: "12px",
            color: "var(--white)"
          }}>
            Top Item List
          </h3>
          <div 
            style={{ 
              backgroundColor: "var(--white)", 
              borderRadius: "var(--border-radius)",
              padding: "16px"
            }}
          >
            <table className="table" style={{ marginBottom: "0" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item name</th>
                  <th>Unit Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.rank}</td>
                    <td>{item.name}</td>
                    <td>{item.unitSold}</td>
                    <td>{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Category List */}
        <div>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "bold", 
            marginBottom: "12px",
            color: "var(--white)"
          }}>
            Top Category List
          </h3>
          <div 
            style={{ 
              backgroundColor: "var(--white)", 
              borderRadius: "var(--border-radius)",
              padding: "16px"
            }}
          >
            <table className="table" style={{ marginBottom: "0" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Unit Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.map((category, index) => (
                  <tr key={index}>
                    <td>{category.rank}</td>
                    <td>{category.name}</td>
                    <td>{category.unitSold}</td>
                    <td>{category.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsSalesRevenue;
