import React from 'react';
import Layout from '../components/Layout';

const Inventory = () => {
  const summaryCards = [
    {
      title: "All Items",
      description: "All item list",
      bgColor: "var(--light-card-bg)",
      textColor: "var(--text-dark)",
      isActive: true
    },
    {
      title: "New Items",
      description: "New item list",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    },
    {
      title: "Categories",
      description: "All item category list",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    },
    {
      title: "Damaged Items",
      description: "Damage item list",
      bgColor: "var(--card-bg)",
      textColor: "var(--white)"
    }
  ];

  const inventoryData = [
    {
      name: "4 Blades Clip Fan",
      category: "Clip Fan",
      quantity: "1",
      price: "180",
      damage: "0",
      dateAdded: "8/10/2025"
    },
    {
      name: "4 Blades Clip Fan",
      category: "Clip Fan",
      quantity: "1",
      price: "180",
      damage: "0",
      dateAdded: "8/10/2025"
    },
    {
      name: "4 Blades Clip Fan",
      category: "Clip Fan",
      quantity: "1",
      price: "180",
      damage: "0",
      dateAdded: "8/10/2025"
    }
  ];

  return (
    <Layout title="Inventory">
      {/* Summary Cards */}
      <div className="grid grid-4 mb-3">
        {summaryCards.map((card, index) => (
          <div 
            key={index}
            className="card"
            style={{ 
              backgroundColor: card.bgColor, 
              color: card.textColor,
              border: card.isActive ? "2px solid #4285F4" : "none",
              cursor: "pointer"
            }}
          >
            <h3 style={{ 
              fontSize: "16px", 
              marginBottom: "8px", 
              fontWeight: "600" 
            }}>
              {card.title}
            </h3>
            <p style={{ 
              fontSize: "14px", 
              opacity: 0.8 
            }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div 
        className="card"
        style={{ 
          backgroundColor: "var(--white)", 
          color: "var(--text-dark)",
          padding: "0"
        }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price per piece</th>
              <th>Damage</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.damage}</td>
                <td>{item.dateAdded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Inventory;
