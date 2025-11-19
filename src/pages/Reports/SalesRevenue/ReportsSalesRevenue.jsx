import { Search, TrendingUp, ChevronDown, Plus, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import './ReportsSalesRevenue.css';
import { useAuth } from '../../../AuthProvider';

const ReportsSalesRevenue = () => {
  const { session } = useAuth();
  
  // --- Report State ---
  const [filter, setFilter] = useState('day');
  const [data, setData] = useState({
    total_items_sold: 0,
    total_revenue: 0,
    top_items: [],
    top_categories: [],
    raw_sales: []
  });
  
  // --- Modal & Form State ---
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]); // For the dropdown
  const [saleForm, setSaleForm] = useState({
    item_id: '',
    quantity: ''
  });

  // --- 1. Fetch Report Data ---
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/sales?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch report");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fetch Inventory List (For the Modal Dropdown) ---
  const fetchInventoryList = async () => {
    try {
      // Re-using your existing items route
      const response = await fetch('/api/items/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const items = await response.json();
        setInventoryItems(items);
      }
    } catch (error) {
      console.error("Error fetching items list:", error);
    }
  };

  // Initial Load
  useEffect(() => {
    if (session) {
      fetchReport();
      fetchInventoryList(); 
    }
  }, [session, filter]);


  // --- 3. Handle Add Sale Submit ---
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!saleForm.item_id || !saleForm.quantity) {
        alert("Please select an item and quantity");
        return;
    }

    try {
        const response = await fetch('/api/reports/sales', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}` 
            },
            body: JSON.stringify(saleForm)
        });

        if (!response.ok) {
            // Read the specific error message from Flask
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to record sale");
        }

        alert(response.status === 201 ? "Sale recorded!" : "Sale recorded and item removed (sold out)!");
        setShowModal(false);
        setSaleForm({ item_id: '', quantity: '' }); 
        fetchReport(); 
        fetchInventoryList();

    } catch (error) {
        console.error(error);
        alert("Error recording sale.");
    }
  };

  if (loading && !data.top_items) return <div style={{padding:'20px'}}>Loading Report...</div>;

  return (
    <>
      <div className="reportsales-main">
        <div className="reportsales-header">
          <h2 className="reportsales-heading">Sales & Revenue</h2>
          <p className="reportsales-desc">
            {filter === 'day' ? 'Daily' : filter === 'week' ? 'Weekly' : 'Monthly'} Sales Report
          </p>
        </div>
        
        {/* Report Display Area */}
        <div className="reportsales-display">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit Sold</th>
                <th>Revenue</th>
                <th>Date Sold</th>
              </tr>
            </thead>
            <tbody>
              {data.raw_sales && data.raw_sales.length > 0 ? (
                data.raw_sales.map((sale, index) => {
                    // Check if the item was deleted (item is null)
                    const itemName = sale.item?.item_name || 'UNLISTED ITEM';
                    const itemPrice = sale.item?.price || 0;
                    const revenue = sale.unit_sold * itemPrice;
                    
                    return (
                        <tr key={index}>
                            <td>{itemName}</td> 
                            <td>{sale.unit_sold}</td>
                            <td>₱{revenue}</td> 
                            <td>{sale.sale_date}</td> 
                        </tr>
                    )
                })
              ) : (
                <tr><td colSpan="4" style={{textAlign:'center'}}>No sales found for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- ACTION ROW --- */}
        <div className="reportsales-inputrow">
          {/* Replaced inputs with a generic "Add Sale" button that opens Modal */}
          <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '10px'}}>
             <span style={{fontSize: '14px', opacity: 0.7}}>Record a new transaction:</span>
          </div>
          <button 
            className="btn btn-secondary reportsales-btn"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} style={{marginRight: '5px'}}/>
            Add Sale
          </button>
        </div>

        {/* Dropdown Filter */}
        <div className="reportsales-dropdownwrap">
          <select 
            className="reportsales-dropdown" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="month">Month</option>  
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
          <ChevronDown className="reportsales-dropdown-icon" size={16} color="var(--primary-bg)" />
        </div>
        
        {/* Summary Cards (Same as before) */} 
        <div className="reportsales-summarycards">
          <div className="card reportsales-summarycard">
            <div className="reportsales-summaryrow">
              <div className="reportsales-summarynum">{data.total_items_sold}</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="reportsales-summarylabel">Items sold</div>
          </div>

          <div className="card reportsales-summarycard">
            <div className="reportsales-summaryrow">
              <div className="reportsales-summarynum">₱{data.total_revenue}</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="reportsales-summarylabel">Total Revenue</div>
          </div>
        </div>


        
        {/* --- TOP ITEM LIST --- */}
        <div className="reportsales-topitemlist">
          <h3 className="reportsales-topitemtitle">Top Item List</h3>
          <div className="reportsales-topitemtablewrap">
            <table className="table reportsales-topitemtable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item name</th>
                  <th>Unit Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.top_items && data.top_items.length > 0 ? (
                    data.top_items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.rank}</td>
                        <td>{item.name}</td>
                        <td>{item.unitSold}</td>
                        <td>₱{item.revenue}</td>
                      </tr>
                    ))
                ) : (
                    <tr><td colSpan="4" style={{textAlign:'center'}}>No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TOP CATEGORY LIST --- */}
        <div className="reportsales-topcatlist">
          <h3 className="reportsales-topcattitle">Top Category List</h3>
          <div className="reportsales-topcattablewrap">
            <table className="table reportsales-topcattable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Unit Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.top_categories && data.top_categories.length > 0 ? (
                    data.top_categories.map((category, index) => (
                      <tr key={index}>
                        <td>{category.rank}</td>
                        <td>{category.name}</td>
                        <td>{category.unitSold}</td>
                        <td>₱{category.revenue}</td>
                      </tr>
                    ))
                ) : (
                    <tr><td colSpan="4" style={{textAlign:'center'}}>No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      
      </div>

      

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Record New Sale</h3>
                    <button onClick={() => setShowModal(false)} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSaleSubmit}>
                    <div className="form-group">
                        <label>Select Item</label>
                        <select 
                            className="input" 
                            required
                            value={saleForm.item_id}
                            onChange={(e) => setSaleForm({...saleForm, item_id: e.target.value})}
                        >
                            <option value="">-- Choose an Item --</option>
                            {inventoryItems.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.item_name} — (Stock: {item.quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quantity Sold</label>
                        <input 
                            type="number" 
                            className="input" 
                            placeholder="0"
                            min="1"
                            required
                            value={saleForm.quantity}
                            onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn btn-secondary" style={{width: '100%'}}>
                            Confirm Sale
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
};

export default ReportsSalesRevenue;