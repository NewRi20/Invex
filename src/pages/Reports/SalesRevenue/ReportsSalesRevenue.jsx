
import { Search, TrendingUp, ChevronDown } from 'lucide-react';
import React from 'react';
import './ReportsSalesRevenue.css';

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
      <div className="card reportsales-main">
        <h2 className="reportsales-heading">Sales & Revenue</h2>
        <p className="reportsales-desc">Sales Daily Report</p>

        {/* Report Display Area */}
        <div className="reportsales-display">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Unit Sold</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through your data here */}
            </tbody>
          </table>
          
        </div>

        {/* Input Row */}
        <div className="reportsales-inputrow">
          <input
            type="text"
            placeholder="Item code"
            className="input reportsales-input"
          />
          <input
            type="text"
            placeholder="Quantity"
            className="input reportsales-input"
          />
          <button className="btn btn-secondary reportsales-btn">Sold</button>
        </div>

        {/* Summary Cards */}
        <div className="reportsales-summarycards">
          <div className="card reportsales-summarycard">
            <div className="reportsales-summaryrow">
              <div className="reportsales-summarynum">210</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="reportsales-summarylabel">Items sold</div>
          </div>

          <div className="card reportsales-summarycard">
            <div className="reportsales-summaryrow">
              <div className="reportsales-summarynum">2500</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="reportsales-summarylabel">Total Revenue</div>
          </div>
        </div>

        {/* Dropdown */}
        <div className="reportsales-dropdownwrap">
          <div className="reportsales-dropdown">
            <span className="reportsales-dropdownlabel">Month</span>
            <ChevronDown size={16} color="var(--text-dark)" />
          </div>
        </div>

        {/* Top Item List */}
        <div className="reportsales-topitemlist">
          <h3 className="reportsales-topitemtitle">Top Item List</h3>
          <div className="reportsales-topitemtablewrap">
            <table className="table reportsales-topitemtable">
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
        <div className="reportsales-topcatlist">
          <h3 className="reportsales-topcattitle">Top Category List</h3>
          <div className="reportsales-topcattablewrap">
            <table className="table reportsales-topcattable">
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
