import Layout from '../components/Layout';
import { Search } from 'lucide-react';

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
    <Layout title="Reports - Stocks">
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

      <div 
        className="card"
        style={{ 
          backgroundColor: "var(--accent-bg)", 
          color: "var(--text-dark)"
        }}
      >
        <h2 style={{ 
          fontSize: "20px", 
          fontWeight: "bold", 
          marginBottom: "20px" 
        }}>
          Stocks Management
        </h2>

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

        {/* Stock Table */}
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
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Enter current Stock"
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #E0E0E0",
                          borderRadius: "4px",
                          fontSize: "12px",
                          width: "120px"
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Enter current amount"
                        style={{
                          padding: "6px 8px",
                          border: "1px solid #E0E0E0",
                          borderRadius: "4px",
                          fontSize: "12px",
                          width: "120px"
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px" }}>{item.date}</span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button 
                          className="btn btn-small"
                          style={{ 
                            backgroundColor: "var(--accent-bg)", 
                            color: "var(--text-dark)",
                            padding: "4px 8px",
                            fontSize: "10px"
                          }}
                        >
                          Save
                        </button>
                        <button 
                          className="btn btn-small"
                          style={{ 
                            backgroundColor: "var(--accent-bg)", 
                            color: "var(--text-dark)",
                            padding: "4px 8px",
                            fontSize: "10px"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
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

export default ReportsStocks;
