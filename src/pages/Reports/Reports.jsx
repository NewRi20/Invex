import React from 'react'; 
import Layout from '../../components/Layout';
import ReportsSalesRevenue from './SalesRevenue/ReportsSalesRevenue.jsx';
import ReportsStocks from './ReportStock/ReportsStocks.jsx';
import ReportsAddDeleteUpdate from './AddDeleteUpdate/ReportsAddDeleteUpdate.jsx';
import { Link, useLocation, Navigate } from 'react-router-dom';

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

  // Helper to extract the last segment of the path
  // If path is /reports/sales-revenue, currentKey = 'sales-revenue'
  const currentKey = location.pathname.split('/').pop();

  if (location.pathname === '/reports') {
    return <Navigate to="/reports/sales-revenue" replace />;
  }

  return (
    <Layout title="Reports">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-[30px]">
        {reportTabs.map((tab) => {
          const isActive = currentKey === tab.key;
          return (
            <Link
              key={tab.key}
              to={tab.path}
              className={`cursor-pointer no-underline flex flex-col p-[16px_20px] rounded-[12px] mb-0 transition-colors
                ${isActive 
                  ? 'bg-[var(--primary-bg-light)] text-[var(--white-blue-text)]' 
                  : 'bg-[var(--secondary-bg)] text-[var(--primary-bg)] hover:bg-[var(--secondary-bg-light)] hover:text-[var(--primary-bg-light)]'
                }`}
            >
              <h3 className="text-lg font-bold mb-2">{tab.title}</h3>
              <p className="text-sm opacity-80">{tab.description}</p>
            </Link>
          );
        })}
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
