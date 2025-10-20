import React from 'react';
import Layout from '../../components/Layout';
import { ArrowRight, PlusCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {

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
          <div><h3>100</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='allItems'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>30</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>

        <div className='damagedItems'>
          <div className='title-section'>
            <p className='title'>Items with Price Update</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>20</h3></div>
          <p className='desc'>Review price changes this week</p>
        </div>
      </div>

      {/* Second Row - Sales Cards */}
      <div className='second-row'>
        <div className='salesCard'>
          <div className='title-section'>
            <p className='title'>Sales</p>
            <span className="arrowIcon"></span>
          </div>
          <div><h3>5000 <span>Php</span></h3></div>
          <p className='desc'>Review sales this week</p>
        </div>

        <div className='revenueGrowthCard'>
          <div className='title-section'>
            <p className='title'>Revenue Growth</p>
            <span className="arrowIcon"></span>
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
              <p className='title'>Items with low sales</p>
              <span className="arrowIcon"></span>
            </div>
            <div><h3>3</h3></div>
            <p className='desc'>Review items with low sales this week</p>
          </div>

          <div className='lowStockCard'>
            <div className='title-section'>
              <p className='title'>Low stock items</p>
              <span className="arrowIcon"></span>
            </div>
            <div><h3>3</h3></div>
            <p className='desc'>Review items with low stock this week</p>
          </div>
        </div>

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


          <button type="button" className="plusIconBtn" aria-label="Add new item">
            <span className="plusIcon" />
          </button>
        
        </table>
      </div>

    </Layout>
  );
};

export default Dashboard;
