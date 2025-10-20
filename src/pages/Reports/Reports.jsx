import React, { useState } from 'react';
import Layout from '../../components/Layout';
import './Reports.css';
import ReportsSalesRevenue from './SalesRevenue/ReportsSalesRevenue.jsx';
import ReportsStocks from './ReportStock/ReportsStocks.jsx';
import ReportsAddDeleteUpdate from './AddDeleteUpdate/ReportsAddDeleteUpdate.jsx';


const Reports = () => {
  const [clickedTab, setClickedTab] = useState(null);

  const reportCards = [
    {
      key: "sales-revenue",
      title: "Sales & Revenue",
      description: "Daily Report",
      link: "/reports/sales-revenue"
    },
    {
      key: "stocks",
      title: "Stocks",
      description: "Daily Report",
      link: "/reports/stocks",
    },
    {
      key: "add-delete-update",
      title: "Add Delete Update",
      description: "Add, delete and update items",
      link: "/reports/add-delete-update"
    }
  ];

  const handleCardClick = (key) => {
    setClickedTab(key);
  };

  return (
    <Layout title="Reports">
      {/* Section Header */}
      <div className="reports-header">
        <h2 className="reports-title">Reports</h2>
      </div>

      {/* Report Cards */}
      <div className="reports-grid">
        {reportCards.map((card) => (
          <div
            key={card.key}
            className={`report-card${clickedTab === card.key ? ' active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(card.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                handleCardClick(card.key);
              }
            }}
          >
            <h3 className="report-card-title">{card.title}</h3>
            <p className="report-card-desc">{card.description}</p>
          </div>
        
        ))}
      </div>

      {/* Render selected report content below cards */}
      <div className="reports-content">
        {clickedTab === 'sales-revenue' && <ReportsSalesRevenue />}
        {clickedTab === 'stocks' && <ReportsStocks />}
        {clickedTab === 'add-delete-update' && <ReportsAddDeleteUpdate />}
      </div>
    </Layout>
  );
};

export default Reports;
