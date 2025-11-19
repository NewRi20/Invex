import React from 'react'; // Removed useEffect, useState (not needed)
import Layout from '../../components/Layout';
import './Reports.css';
import ReportsSalesRevenue from './SalesRevenue/ReportsSalesRevenue.jsx';
import ReportsStocks from './ReportStock/ReportsStocks.jsx';
import ReportsAddDeleteUpdate from './AddDeleteUpdate/ReportsAddDeleteUpdate.jsx';
import { Link, useLocation, Navigate } from 'react-router-dom'; // Added Navigate

const Reports = () => {
  const location = useLocation();

  // 1. Define the tabs configuration
  const reportTabs = [
    { 
      key: 'sales-revenue', 
      path: '/reports/sales-revenue', 
      title: 'Sales & Revenue', 
      description: 'Daily Report' 
    },
    { 
      key: 'stocks', 
      path: '/reports/stocks', 
      title: 'Stocks', 
      description: 'Daily Report' 
    },
    { 
      key: 'add-delete-update', 
      path: '/reports/add-delete-update', 
      title: 'Add Delete Update', 
      description: 'Add, delete and update items' 
    }
  ];

  const currentKey = location.pathname.split('/').pop();

  if (location.pathname === '/reports') {
    return <Navigate to="/reports/sales-revenue" replace />;
  }

  return (
    <Layout title="Reports">
      <div className="reports-grid">
        {reportTabs.map((tab) => (
          <Link
            key={tab.key}
            to={tab.path}
            className={`report-card ${currentKey === tab.key ? 'active' : ''}`}
          >
            <h3 className="report-card-title">{tab.title}</h3>
            <p className="report-card-desc">{tab.description}</p>
          </Link>
        ))}
      </div>

      {/* Component Rendering Area */}
      <div className="reports-content">
        {currentKey === 'sales-revenue' && <ReportsSalesRevenue />}
        {currentKey === 'stocks' && <ReportsStocks />}
        {currentKey === 'add-delete-update' && <ReportsAddDeleteUpdate />}
      </div>

    </Layout>
  );
};

export default Reports;