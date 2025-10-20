
import React from 'react';
import { Search } from 'lucide-react';
import './ReportStocks.css';

const ReportsStocks = () => {
  const stockData = [
    {
      code: "0009",
      name: "40DeckorClip Fan",
      category: "Clip Fan",
      currentStock: "15",
      date: "19/10/2025"  
    }
  ];

  return (
    <>

      <div className="reportstocks-main">
        <div className="reportstocks-header">
          <h2>Stocks Management</h2>
          <div className="reportstocks-searchbar">
            <input
              type="text"
              placeholder="Search"
              className="searchinput"
            />
            <Search size={20} className="searchicon" />
          </div>
        </div>
        <div className="reportstocks-tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Action</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item, index) => (
                <tr key={index}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.currentStock}</td>
                  <td>
                    <div className="reportstocks-actioninputs">
                      <input type="text" placeholder="Enter number to add" className="reportstocks-input" />
                      <input type="text" placeholder="Enter number to deduct" className="reportstocks-input" />
                    </div>
                  </td>
                  <td>
                    <div className="reportstocks-actionrow">
                      <span className="reportstocks-date">{item.date}</span>
                      <div className="reportstocks-actionbtns">
                        <button className="btn btn-small reportstocks-btn">Save</button>
                        <button className="btn btn-small reportstocks-btn">Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};


export default ReportsStocks;

