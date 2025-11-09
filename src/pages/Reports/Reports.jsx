import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import './Reports.css';
import ReportsSalesRevenue from './SalesRevenue/ReportsSalesRevenue.jsx';
import ReportsStocks from './ReportStock/ReportsStocks.jsx';
import ReportsAddDeleteUpdate from './AddDeleteUpdate/ReportsAddDeleteUpdate.jsx';
import { Link, useLocation } from 'react-router-dom';


const Reports = () => {
  const [clickedTab, setClickedTab] = useState(null);
  
  const reportId = [
    {id: 1, path: '/reports/sales-revenue', title: 'Sales & Revenue' },
    {id: 2, path: '/reports/stocks', title: 'Stocks' },
    {id: 3, path: '/reports/add-delete-update', title: 'Add Delete Update' }
  ]

  const reportCards = reportId.map(({ id, path, title }) => ({
    key: path.split('/').pop(),
    title,
    description: id === 3 ? 'Add, delete and update items' : 'Daily Report',
    link: path,
  }));

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/reports/')) {
      const seg = location.pathname.split('/').pop();
      setClickedTab(seg || 'sales-revenue');
    } else if (location.pathname === '/reports') {
      setClickedTab('sales-revenue');
    }
  }, [location.pathname]);

  return (
    <Layout title="Reports">
      <div className="reports-grid">
        {reportCards.map((card) => (
          <Link
            key={card.key}
            to={card.link}
            className={`report-card${clickedTab === card.key ? ' active' : ''}`}
          >
            <h3 className="report-card-title">{card.title}</h3>
            <p className="report-card-desc">{card.description}</p>
          </Link>
        ))}
      </div>

      
      <div className="reports-content">
        {clickedTab === 'sales-revenue' && <ReportsSalesRevenue />}
        {clickedTab === 'stocks' && <ReportsStocks />}
        {clickedTab === 'add-delete-update' && <ReportsAddDeleteUpdate />}
      </div>
    </Layout>
  );
};

export default Reports;
