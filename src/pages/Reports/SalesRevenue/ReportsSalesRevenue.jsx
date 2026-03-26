import { TrendingUp, Plus, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../AuthProvider';
import { API_BASE_URL } from '../../../config';

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
  const [editingSaleId, setEditingSaleId] = useState(null); 
  const [editQuantity, setEditQuantity] = useState('');
  
  // --- Modal & Form State ---
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]); 
  const [saleForm, setSaleForm] = useState({
    item_id: '',
    quantity: ''
  });

  
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reports/sales?filter=${filter}`, {
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

  
  const fetchInventoryList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const itemsResponse = await response.json();
        const itemList = Array.isArray(itemsResponse.items) ? itemsResponse.items : [];
        setInventoryItems(itemList);
      }
    } catch (error) {
      console.error("Error fetching items list:", error);
    }
  };

  
  useEffect(() => {
    if (session) {
      fetchReport();
      fetchInventoryList(); 
    }
  }, [session, filter]);


  
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!saleForm.item_id || !saleForm.quantity) {
        alert("Please select an item and quantity");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reports/sales`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}` 
            },
            body: JSON.stringify(saleForm)
        });

        if (!response.ok) {
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


  const handleDelete = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale transaction? Stock will be added back.")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reports/${saleId}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete sale.");
        }

        alert("Sale deleted and stock restored!");
        fetchReport(); 
        fetchInventoryList(); 
    } catch (error) {
        console.error("Delete Failed:", error);
        alert(`Deletion Failed: ${error.message}`);
    }
  };

  
  const handleSaveEdit = async (saleId) => {
      
      const newQuantity = parseInt(editQuantity, 10);
      
      if (isNaN(newQuantity) || newQuantity <= 0) {
          alert("Quantity must be a positive number (1 or greater).");
          return;
      }

      try {
          
          const response = await fetch(`${API_BASE_URL}/reports/${saleId}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ unit_sold: newQuantity }) 
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || errorData.message || 'Failed to save edit.');
          }

          alert("Sale corrected and stock adjusted successfully!");
          setEditingSaleId(null);
          setEditQuantity('');
          fetchReport(); 

      } catch (error) {
          console.error("Save Failed:", error);
          alert(`Save Failed: ${error.message}`);
      }
  };

  if (loading && !data.top_items) return <div style={{padding:'20px'}}>Loading Report...</div>;

  return (
    <>
      <div className="p-5 bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] mb-5">
        <div className="flex flex-col bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 mb-5 rounded-[20px]">
          <h2 className="text-xl font-bold mb-1.5">Sales & Revenue</h2>
          <p className="text-base opacity-80">
            {filter === 'day' ? 'Daily' : filter === 'week' ? 'Weekly' : 'Monthly'} Sales Report
          </p>
        </div>
        
        {/* Report Display Area */}
        <div className="bg-[var(--card-bg)] max-h-[300px] md:max-h-[400px] border border-[var(--primary-bg)] mb-2.5 p-2.5 text-[var(--primary-bg-light)] overflow-y-auto rounded-[10px]">
          <table className="w-full min-w-[600px] lg:min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 md:p-3">Item Name</th>
                <th className="text-center p-2 md:p-3">Unit Sold</th>
                <th className="text-left p-2 md:p-3">Revenue</th>
                <th className="text-left p-2 md:p-3">Date Sold</th>
                <th className="text-left p-2 md:p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.raw_sales && data.raw_sales.length > 0 ? (
                data.raw_sales.map((sale, index) => {

                    const isEditing = editingSaleId === sale.id;
                    const itemName = sale.item?.item_name || 'UNLISTED ITEM';
                    const itemPrice = sale.item?.price || 0;
                    const revenue = sale.unit_sold * itemPrice;
                    
                    return (
                        <tr key={index} className="border-b border-gray-100 last:border-none">
                            <td className="text-left p-2 md:p-3">{itemName}</td> 
                            <td className="text-center p-2 md:p-3">
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={editQuantity}
                                        onChange={(e) => setEditQuantity(e.target.value)}
                                        min="1"
                                        style={{width: '70px', textAlign: 'center'}}
                                        className="border rounded p-1"
                                    />
                                ) : (
                                    sale.unit_sold
                                )}
                            </td>
                            <td className="text-left p-2 md:p-3">₱{revenue}</td> 
                            <td className="text-left p-2 md:p-3">{sale.sale_date}</td> 
                            <td className="text-center p-2 md:p-3">
                              {isEditing ? (
                                  <div className="grid grid-cols-2 gap-2.5">
                                      <button 
                                          className="bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none py-1.5 px-3 rounded-[6px] text-sm hover:bg-[var(--Btn-bg-blue-light)]"
                                          onClick={() => handleSaveEdit(sale.id)}
                                      >
                                          Save
                                      </button>
                                      <button 
                                          className="bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none py-1.5 px-3 rounded-[6px] text-sm hover:bg-[var(--Btn-bg-blue-light)]"
                                          onClick={() => setEditingSaleId(null)}
                                      >
                                          Cancel
                                      </button>
                                  </div>
                              ) : (
                                  <div className="grid grid-cols-2 gap-2.5">
                                    <button 
                                          className="bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none py-1.5 px-3 rounded-[6px] text-sm hover:bg-[var(--Btn-bg-blue-light)]"
                                          onClick={() => {
                                              setEditingSaleId(sale.id);
                                              setEditQuantity(sale.unit_sold.toString()); 
                                          }}
                                      >
                                          Edit
                                      </button>
                                      <button 
                                          className="bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none py-1.5 px-3 rounded-[6px] text-sm hover:bg-[var(--Btn-bg-blue-light)]"
                                          onClick={() => handleDelete(sale.id)}
                                      >
                                          Undo Sale
                                      </button>
                                  </div>
                              )}
                          </td>
                        </tr>
                    )
                })
              ) : (
                <tr><td colSpan="5" className="text-center p-4">No sales found for this period</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- ACTION ROW --- */}
        <div className="flex md:flex-row gap-3 mb-8">
          <div className="flex-1 flex items-center gap-2.5">
             <span className="text-sm opacity-70">Record a new transaction:</span>
          </div>
          <button 
            className="flex whitespace-nowrap items-center justify-center p-2 rounded bg-[var(--primary-bg)] text-[var(--white-blue-text)] hover:bg-[var(--primary-bg-light)] min-w-[60px]"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} className="mr-1.5"/>
            Add Sale
          </button>
        </div>

        {/* Dropdown Filter */}
        <div className="relative inline-block mt-5 mb-2.5">
          <select 
            className="flex items-center gap-2 text-sm py-2 pl-3 pr-10 bg-[var(--primary-bg-light)] rounded-[10px] cursor-pointer border-none outline-none appearance-none text-[var(--white-blue-text)] w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="month">Month</option>  
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
        
        {/* Summary Cards (Same as before) */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5 mb-6">
          <div className="card bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] rounded-[8px] p-4 mb-0">
            <div className="flex items-center gap-2 text-[var(--primary-bg)]">
              <div className="text-3xl font-bold text-[var(--primary-bg-light)]">{data.total_items_sold}</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="text-sm mt-1 text-[var(--primary-bg-light)] opacity-80">Items sold</div>
          </div>

          <div className="card bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] rounded-[8px] p-4 mb-0">
            <div className="flex items-center gap-2 text-[var(--primary-bg)]">
              <div className="text-3xl font-bold text-[var(--primary-bg-light)]">₱{data.total_revenue}</div>
              <TrendingUp size={20} color="#00FF00" />
            </div>
            <div className="text-sm mt-1 text-[var(--primary-bg-light)] opacity-80">Total Revenue</div>
          </div>
        </div>


        
        {/* --- TOP ITEM LIST --- */}
        <div className="mb-6">
          <h3 className="bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 rounded-[20px] mb-2.5 text-lg font-bold">Top Item List</h3>
          <div className="bg-white rounded-[var(--border-radius)] p-4 overflow-x-auto">
            <table className="table w-full mb-0">
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
                    <tr><td colSpan="4" className="text-center p-4">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TOP CATEGORY LIST --- */}
        <div className="mb-6">
          <h3 className="bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 rounded-[20px] mb-2.5 text-lg font-bold">Top Category List</h3>
          <div className="bg-white rounded-[var(--border-radius)] p-4 overflow-x-auto">
            <table className="table w-full mb-0">
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
                    <tr><td colSpan="4" className="text-center p-4">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      
      </div>

      

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 w-full h-full bg-black/60 flex justify-center items-center z-[2000] backdrop-blur-[2px]" onClick={() => setShowModal(false)} >
            <div className="bg-[var(--primary-bg-light)] p-6 rounded-[15px] w-[90%] max-w-[400px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] text-[var(--white-blue-text)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-2.5">
                    <h3 className="font-bold text-lg">Record New Sale</h3>
                    <button onClick={() => setShowModal(false)} className="bg-transparent border-none cursor-pointer text-[var(--white-blue-text)] hover:opacity-75">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSaleSubmit}>
                    <div className="flex flex-col mb-4 gap-2">
                        <label className="font-medium">Select Item</label>
                        <select 
                            className="input w-full p-2 rounded bg-white text-black border border-gray-300" 
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

                    <div className="flex flex-col mb-4 gap-2">
                        <label className="font-medium">Quantity Sold</label>
                        <input 
                            type="number" 
                            className="input w-full p-2 rounded bg-white text-black border border-gray-300" 
                            placeholder="0"
                            min="1"
                            required
                            value={saleForm.quantity}
                            onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                        />
                    </div>

                    <div className="mt-5">
                        <button type="submit" className="w-full bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] py-2 rounded font-semibold hover:bg-[var(--Btn-bg-blue-light)] transition-colors">
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
