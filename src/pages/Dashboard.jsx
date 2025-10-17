import React from 'react';
import Layout from '../components/Layout';
import { ArrowRight, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const statsCards = [
    {
      title: "Items with Price Update",
      value: "10",
      description: "Review price changes this week",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    },
    {
      title: "New Items",
      value: "100",
      description: "Review new items this week",
      bgColor: "var(--light-card-bg)",
      textColor: "var(--text-dark)"
    },
    {
      title: "All Items",
      value: "30",
      description: "Review all items this month",
      bgColor: "var(--light-card-bg)",
      textColor: "var(--text-dark)"
    },
    {
      title: "Damaged Items",
      value: "20",
      description: "Review damaged items this week",
      bgColor: "var(--light-card-bg)",
      textColor: "var(--text-dark)"
    }
  ];

  const salesCards = [
    {
      title: "Sales",
      value: "5000 Php",
      description: "Review sales this week",
      bgColor: "var(--peach-bg)",
      textColor: "var(--text-dark)"
    },
    {
      title: "Revenue Growth",
      value: "15%",
      description: "Review revenue growth this week comparing last week",
      bgColor: "var(--peach-bg)",
      textColor: "var(--text-dark)"
    }
  ];

  const lowStockCards = [
    {
      title: "Items with low sales",
      value: "3",
      description: "Review items with low sales this week",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    },
    {
      title: "Low Stock Items",
      value: "5",
      description: "Review items with low stock this week",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    }
  ];

  const itemsList = [
    { name: "Item 1", quantity: "25" },
    { name: "Item 2", quantity: "19" },
    { name: "Item 3", quantity: "19" },
    { name: "Item 4", quantity: "14" },
    { name: "Item 5", quantity: "10" },
    { name: "Item 6", quantity: "6" }
  ];

  return (
    <Layout title="Dashboard">
      {/* Welcome Banner */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--card-bg)", // revert to original
          color: "var(--white)",
          textAlign: "center",
          padding: "20px"
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Welcome back, User!</h2>
      </div>

      {/* First Row - Stats Cards */}
      <div className="grid grid-4 mb-3">
        {statsCards.map((card, index) => (
          <div 
            key={index}
            className="card"
            style={{ 
              backgroundColor: card.bgColor, 
              color: card.textColor,
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: "16px", right: "16px" }}>
              <ArrowRight size={20} color={card.textColor} />
            </div>
            <h3 style={{ fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>
              {card.title}
            </h3>
            <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
              {card.value}
            </div>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Second Row - Sales Cards */}
      <div className="grid grid-2 mb-3">
        {salesCards.map((card, index) => (
          <div 
            key={index}
            className="card"
            style={{ 
              backgroundColor: card.bgColor, 
              color: card.textColor,
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: "16px", right: "16px" }}>
              <ArrowRight size={20} color={card.textColor} />
            </div>
            <h3 style={{ fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>
              {card.title}
            </h3>
            <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
              {card.value}
            </div>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Third Row - Low Stock and Items List */}
      <div className="grid grid-3">
        {lowStockCards.map((card, index) => (
          <div 
            key={index}
            className="card"
            style={{ 
              backgroundColor: card.bgColor, 
              color: card.textColor,
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: "16px", right: "16px" }}>
              <ArrowRight size={20} color={card.textColor} />
            </div>
            <h3 style={{ fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>
              {card.title}
            </h3>
            <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "8px" }}>
              {card.value}
            </div>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>
              {card.description}
            </p>
          </div>
        ))}

        {/* Items List Card */}
        <div 
          className="card"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            color: "var(--white)",
            position: 'relative'
          }}
        >
          <h3 style={{ fontSize: "14px", marginBottom: "16px", fontWeight: "500" }}>
            Items List
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {itemsList.map((item, index) => (
              <div 
                key={index}
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  fontSize: "14px"
                }}
              >
                <span>{item.name}</span>
                <span>{item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ 
            position: "absolute", 
            bottom: "16px", 
            right: "16px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#FF6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}>
            <PlusCircle size={24} color="var(--white)" fill="#FF6B6B" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
