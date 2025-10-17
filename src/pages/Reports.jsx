import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Reports = () => {
  const reportCards = [
    {
      title: "Reports",
      description: "General reports overview",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)",
      isActive: true
    },
    {
      title: "Sales & Revenue",
      description: "Daily Report",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)",
      link: "/reports/sales-revenue"
    },
    {
      title: "Stocks",
      description: "Daily Report",
      bgColor: "var(--light-peach)",
      textColor: "var(--text-dark)",
      link: "/reports/stocks",
      isHighlighted: true
    },
    {
      title: "Add Delete Update",
      description: "Add, delete and update items",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)",
      link: "/reports/add-delete-update"
    }
  ];

  return (
    <Layout title="Reports">
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

      {/* Report Cards */}
      <div className="grid grid-1" style={{ gap: "16px" }}>
        {reportCards.map((card, index) => {
          const CardComponent = card.link ? Link : 'div';
          const cardProps = card.link ? { to: card.link } : {};
          
          return (
            <CardComponent
              key={index}
              {...cardProps}
              className="card"
              style={{ 
                backgroundColor: card.bgColor, 
                color: card.textColor,
                cursor: card.link ? "pointer" : "default",
                textDecoration: "none",
                display: "block"
              }}
            >
              <h3 style={{ 
                fontSize: "18px", 
                marginBottom: "8px", 
                fontWeight: "bold" 
              }}>
                {card.title}
              </h3>
              <p style={{ 
                fontSize: "14px", 
                opacity: 0.8 
              }}>
                {card.description}
              </p>
            </CardComponent>
          );
        })}
      </div>
    </Layout>
  );
};

export default Reports;
