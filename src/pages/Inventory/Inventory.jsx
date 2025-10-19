import React, { useState } from 'react';
import Layout from '../../components/Layout';
import './Inventory.css';


const Inventory = () => {

  const summaryCards = [
    { key: 'all', title: 'All Items', description: 'All item list' },
    { key: 'new', title: 'New Items', description: 'New item list' },
    { key: 'categories', title: 'Categories', description: 'All item category list' },
    { key: 'damaged', title: 'Damaged Items', description: 'Damage item list' },
  ];

  const allItemsData = [
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

  const newItemsData = [
    {
      name: "Big 4 Blades Clip Fan",
      category: "Clip Fan",
      quantity: "1",
      price: "200",
      damage: "0",
      dateAdded: "19/10/2025"
    }
  ];

  const categoryData = [
    {
      name: "Clip Fan",
      quantity: "5"
    },
    {
      name: "LED Bulb EC Light",
      quantity: "3"
    },
    {
      name: "Ceiling Fan",
      quantity: "1"
    }
  ];

  const damagedItemsData = [
    {
      name: "4 Blades Clip Fan",
      category: "Clip Fan",
      quantity: "1",
      price: "180",
      damage: "0",
      dateAdded: "8/10/2025"
    }
  ];

  const [activeTab, setActiveTab] = useState('all');

  return (
    <Layout title="Inventory">
      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className={`summary-card ${activeTab === card.key ? 'active' : ''}`}
            onClick={() => setActiveTab(card.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(card.key); }}
          >
            <h3 className="title">
              {card.title}
            </h3>
            <p className="desc">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="table-card">
        <table className="table">
          <thead>
            {activeTab === 'categories' ? (
              <tr>
                <th>Category</th>
                <th>Quantity</th>
              </tr>
            ) : (
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price per piece</th>
                <th>Damage</th>
                <th>Date Added</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'categories' ? (
              categoryData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.name}</td>
                  <td>{row.quantity}</td>
                </tr>
              ))
            ) : (
              (activeTab === 'new' ? newItemsData : activeTab === 'damaged' ? damagedItemsData : allItemsData)
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>{item.damage}</td>
                    <td>{item.dateAdded}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Inventory;
