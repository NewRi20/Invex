import { Search } from 'lucide-react';
import React from 'react';
import './ReportsAddDeleteUpdate.css';

const ReportsAddDeleteUpdate = () => {
  const itemData = [
    {
      code: "0001",
      name: "4 Blades Clip Fan",
      category: "Clip Fan",
      stock: "10",
      lastModified: "19/02/2025"
    },
    {
      code: "0002",
      name: "Big 4 Blades Clip Fan",
      category: "Clip Fan",
      stock: "5",
      lastModified: "19/02/2025"
    }
  ];

  return (
    <>
      {/* Add Item Section */}
      <div className="reportadu-additem">
        <h3 className="reportadu-additem-title">Add Item</h3>

        <div className="reportadu-additem-inputs">
          <input
            type="text"
            placeholder="Name"
            className="input"
          />
          <input
            type="text"
            placeholder="Category"
            className="input"
          />
          <input
            type="text"
            placeholder="Quantity"
            className="input"
          />
        </div>

        <div className="reportadu-additem-buttons">
          <button className="btn btn-small reportadu-additem-btn">
            Save
          </button>
          <button className="btn btn-small reportadu-additem-btn">
            Clear
          </button>
        </div>
      </div>

      {/* Item List Section */}
      <div className="reportadu-itemlist">
        <div className="reportadu-itemlist-header">
          <h3 className="reportadu-itemlist-title">Item List</h3>

          {/* Search Bar */}
          <div className="reportadu-searchwrap">
            <input
              type="text"
              placeholder="Search"
              className="reportadu-search"
            />
            <Search size={20} className="reportadu-search-icon" />
          </div>
        </div>

        {/* Item Table */}
        <div className="reportadu-tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Last Modified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {itemData.map((item, index) => (
                <tr key={index}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.stock}</td>
                  <td>{item.lastModified}</td>
                  <td>
                    <div className="reportadu-actions">
                      <button className="btn btn-small reportadu-action-btn">
                        Change Category
                      </button>
                      <button className="btn btn-small reportadu-action-btn">
                        Rename
                      </button>
                      <button className="btn btn-small reportadu-action-btn">
                        Delete
                      </button>
                      <button className="btn btn-small reportadu-action-btn">
                        Save
                      </button>
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

export default ReportsAddDeleteUpdate;
