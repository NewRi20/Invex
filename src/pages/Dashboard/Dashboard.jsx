import React from 'react';
import Layout from '../../components/Layout';
import { ArrowRight, PlusCircle } from 'lucide-react';
import './Dashboard.css';

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
      <div className="welcome-card">
        <h2 className="welcome-title">Welcome back, User!</h2>
      </div>


      {/* First Row - Stats Cards */}
      <div className="first-row">
        <div className='priceUpdate'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>10</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='newItems'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>10</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='allItems'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>10</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='damagedItems'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>10</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>
      </div>

      {/* Second Row - Sales Cards */}
      {/* <div className="grid grid-2 mb-3">
        {salesCards.map((card, index) => (
          <div key={index} className="card dash-card bg-peach text-dark">
            <div className="arrow-top-right">
              <ArrowRight size={20} color="#333333" />
            </div>
            <h3 className="card-title-sm">{card.title}</h3>
            <div className="card-value-lg">{card.value}</div>
            <p className="card-desc-xs">{card.description}</p>
          </div>
        ))}
      </div> */}

      {/* Third Row - Low Stock and Items List */}
      {/* <div className="grid grid-3">
        {lowStockCards.map((card, index) => (
          <div key={index} className={`card dash-card ${
              card.bgColor === 'var(--card-bg)'
                ? 'bg-card text-white'
                : 'bg-light text-dark'
            }`}>
            <div className="arrow-top-right">
              <ArrowRight size={20} color={card.textColor === 'var(--white)' ? '#FFFFFF' : '#333333'} />
            </div>
            <h3 className="card-title-sm">{card.title}</h3>
            <div className="card-value-lg">{card.value}</div>
            <p className="card-desc-xs">{card.description}</p>
          </div>
        ))}

        
        <div className="card dash-card bg-card text-white"> 
          <h3 className="card-title-sm">Items List</h3>
          <div className="items-list">
            {itemsList.map((item, index) => (
              <div key={index} className="item-row">
                <span>{item.name}</span>
                <span>{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="fab">
            <PlusCircle size={24} color="var(--white)" fill="#FF6B6B" />
          </div>
        </div>
      </div> */}
    </Layout>
  );
};

export default Dashboard;
