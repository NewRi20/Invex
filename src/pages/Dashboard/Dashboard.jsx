import React from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom'; 
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

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
            <span className="arrowIcon" onClick={() => navigate('/pricing')}></span>
          </div>
          <div><h3>10</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='newItems'>
          <div className='title-section'>
            <p className='title'>New Items</p>
            <span className="arrowIcon" onClick={() => navigate('/inventory/new-items')}></span>
          </div>
          <div><h3>100</h3></div>
          <p className='desc'>Review new items this week</p>
        </div>

        <div className='allItems'>
          <div className='title-section'>
            <p className='title'>All Items</p>
            <span className="arrowIcon" onClick={() => navigate('/inventory/all-items')}></span>
          </div>
          <div><h3>30</h3></div>
          <p className='desc'>Review all items this week</p>
        </div>

        <div className='damagedItems'>
          <div className='title-section'>
            <p className='title'>Damaged Items</p>
            <span className="arrowIcon" onClick={() => navigate('/inventory/damaged-items')}></span>
          </div>
          <div><h3>20</h3></div>
          <p className='desc'>Review damaged items this week</p>
        </div>
      </div>

      {/* Second Row - Sales Cards */}
      <div className='second-row'>
        <div className='salesCard'>
          <div className='title-section'>
            <p className='title'>Sales</p>
            <span className="arrowIcon" onClick={() => navigate('/reports/sales/sales-revenue')}></span>
          </div>
          <div><h3>5000 <span>Php</span></h3></div>
          <p className='desc'>Review sales this week</p>
        </div>

        <div className='revenueGrowthCard'>
          <div className='title-section'>
            <p className='title'>Revenue Growth</p>
            <span className="arrowIcon" onClick={() => navigate('/reports/sales/sales-revenue')}></span>
          </div>
          <div><h3>15%</h3></div>
          <p className='desc'>Review revenue growth this week comparing last week</p>
        </div>

      </div>

      {/* Third Row */}
      <div className='third-row'>
        <div className='inner-container-lowCards'>
          <div className='lowSalesCard'>
            <div className='title-section'>
              <p className='title'>Items with top sales</p>
              <span className="arrowIcon" onClick={() => navigate('/reports/sales/sales-revenue')}></span>
            </div>
            <div><h3>3</h3></div>
            <p className='desc'>Review items with top sales this week</p>
          </div>

          <div className='lowStockCard'>
            <div className='title-section'>
              <p className='title'>Low stock items</p>
              <span className="arrowIcon" onClick={() => navigate('/reports/stocks')}></span>
            </div>
            <div><h3>3</h3></div>
            <p className='desc'>Review items with low stock this week</p>
          </div>
        </div>

        <div className="items-list-container">
          <table className="ItemsListCard">
            <thead className='itemListHeader'>
              <tr>
                <th className="card-title">Items List</th>
                <th className='quantity'>Quantity</th>
              </tr>
            </thead>

            <tbody>
              {itemsList.map((item, index) => (
                <tr key={index} className="item-row">
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            type="button" 
            className="plusIconBtn" 
            aria-label="Add new item" 
            onClick={() => navigate('/reports/add-delete-update')}
          >
            <span className="plusIcon" />
          </button>
        </div>
      </div>

    </Layout>
  );
};

export default Dashboard;
