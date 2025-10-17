import Layout from '../components/Layout';
import { Search } from 'lucide-react';

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
    <Layout title="Reports - AddDeleteUpdate">
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

      {/* Add Item Section */}
      <div 
        className="card mb-3"
        style={{ 
          backgroundColor: "var(--light-card-bg)", 
          color: "var(--text-dark)"
        }}
      >
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          marginBottom: "20px" 
        }}>
          Add Item
        </h3>

        <div className="grid grid-3 mb-3">
          <input
            type="text"
            placeholder="Name"
            className="input"
            style={{ marginBottom: "0" }}
          />
          <input
            type="text"
            placeholder="Category"
            className="input"
            style={{ marginBottom: "0" }}
          />
          <input
            type="text"
            placeholder="Quantity"
            className="input"
            style={{ marginBottom: "0" }}
          />
        </div>

        <div className="flex-end gap-2">
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--peach-bg)", 
              color: "var(--text-dark)"
            }}
          >
            Save
          </button>
          <button 
            className="btn btn-small"
            style={{ 
              backgroundColor: "var(--peach-bg)", 
              color: "var(--text-dark)"
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Item List Section */}
      <div 
        className="card"
        style={{ 
          backgroundColor: "var(--light-card-bg)", 
          color: "var(--text-dark)"
        }}
      >
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          marginBottom: "20px" 
        }}>
          Item List
        </h3>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search"
            className="input"
            style={{ paddingRight: "40px" }}
          />
          <Search 
            size={20} 
            style={{ 
              position: "absolute", 
              right: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }} 
          />
        </div>

        {/* Item Table */}
        <div 
          style={{ 
            backgroundColor: "var(--white)", 
            borderRadius: "var(--border-radius)",
            padding: "0",
            overflow: "hidden"
          }}
        >
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
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      <button 
                        className="btn btn-small"
                        style={{ 
                          backgroundColor: "var(--peach-bg)", 
                          color: "var(--text-dark)",
                          fontSize: "10px",
                          padding: "4px 6px"
                        }}
                      >
                        Change Category
                      </button>
                      <button 
                        className="btn btn-small"
                        style={{ 
                          backgroundColor: "var(--peach-bg)", 
                          color: "var(--text-dark)",
                          fontSize: "10px",
                          padding: "4px 6px"
                        }}
                      >
                        Rename
                      </button>
                      <button 
                        className="btn btn-small"
                        style={{ 
                          backgroundColor: "var(--peach-bg)", 
                          color: "var(--text-dark)",
                          fontSize: "10px",
                          padding: "4px 6px"
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        className="btn btn-small"
                        style={{ 
                          backgroundColor: "var(--peach-bg)", 
                          color: "var(--text-dark)",
                          fontSize: "10px",
                          padding: "4px 6px"
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsAddDeleteUpdate;
