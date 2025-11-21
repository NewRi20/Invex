import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import './ReportStocks.css';
import { useAuth } from '../../../AuthProvider'; // Import Auth

const ReportsStocks = () => {
    const { session } = useAuth();

    // --- State ---
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State to hold pending changes for all visible rows
    const [editValues, setEditValues] = useState({}); 

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // --- Data Fetch ---
    const fetchItems = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            // Re-using the /api/items/ route to get all user items
            const response = await fetch('/api/items/', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await response.json();
            
            // Extract the simple name from the nested object (item_category)
            const processedData = Array.isArray(data.items)
            ? data.items.map(item => ({
                ...item,
                categoryName: item.item_category?.name || 'Uncategorized',
            }))
            : [];

            setAllItems(processedData);
            setFilteredItems(processedData);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    
    // --- Search Logic ---
    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = allItems.filter(item => 
            item.item_name.toLowerCase().includes(query) ||
            item.categoryName.toLowerCase().includes(query)
        );
        setFilteredItems(filtered);
    }, [searchQuery, allItems]);

    // --- Input Change Handler ---
    // Updates the temporary input values for the specific item row
    const handleInputChange = (itemId, field, value) => {
        setEditValues(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value 
            }
        }));
    };

    // --- Action: Save/Update Stock ---
    const handleSave = async (item) => {
        const itemId = item.id;
        const updates = editValues[itemId];

        if (!updates || (!updates.addStock && !updates.removeDamaged)) {
            alert("No changes entered.");
            return;
        }

        // Calculate the final quantity and damaged quantity based on current values
        const currentStock = item.quantity;
        const currentDamaged = item.damaged_quantity;
        
        // Use + to ensure inputs are treated as numbers
        const stockChange = +(updates.addStock || 0);
        const damageChange = +(updates.removeDamaged || 0); 
        
        const newStock = currentStock + stockChange;
        const newDamaged = currentDamaged + damageChange;

        // 1. Prepare data payload
        const payload = {
          addStock: updates.addStock || 0,
          removeDamaged: updates.removeDamaged || 0
        };
        
        if (stockChange !== 0) payload.quantity = newStock;
        if (damageChange !== 0) payload.damaged_quantity = newDamaged;

        if (newStock < 0) {
             alert("Error: Stock cannot go below zero.");
             return;
        }
        
        try {
            // 2. Call PATCH endpoint
            const response = await fetch(`/api/items/${itemId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error during update.`);
            }

            // 3. Success: Clear temporary inputs and refresh data
            setEditValues(prev => {
                const newState = { ...prev };
                delete newState[itemId]; // Clear the specific input fields
                return newState;
            });
            fetchItems(); // Re-fetch the data to show updated stock
            alert("Stock updated successfully!");

        } catch (error) {
            console.error(error);
            alert(`Update Failed: ${error.message}`);
        }
    };

    // --- Action: Cancel ---
    const handleCancel = (itemId) => {
         setEditValues(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
        });
    };

    if (loading) return <div>Loading Stock Report...</div>;

    return (
        <>
            <div className="reportstocks-main">
                <div className="reportstocks-header">
                    <h2>Stocks Management</h2>
                    <div className="reportstocks-searchbar">
                        <input
                            type="text"
                            placeholder="Search Name or Category"
                            className="searchinput"
                            value={searchQuery}
                            onChange={handleSearch}
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
                              <th>Damaged Stock</th>
                              <th>Actions</th>
                              <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign: 'center'}}>No items matching search criteria.</td></tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isEditing = !!editValues[item.id];
                                    return (
                                      <tr key={item.id}>
                                          <td>{String(item.id).substring(0, 8)}...</td>
                                          <td>{item.item_name}</td>
                                          <td>{item.categoryName}</td>
                                          <td>{item.quantity}</td>
                                          <td>{item.damaged_quantity}</td> 
                                          <td>
                                              <div className="reportstocks-actioninputs">
                                                  <input 
                                                      type="number" 
                                                      placeholder="Add Stock (+)" 
                                                      className="reportstocks-input add-stock"
                                                      value={editValues[item.id]?.addStock || ''}
                                                      onChange={(e) => handleInputChange(item.id, 'addStock', e.target.value)}
                                                      disabled={isEditing && !editValues[item.id]?.addStock}
                                                  />
                                                  <input 
                                                      type="number" 
                                                      placeholder="Remove Damaged (-)" 
                                                      className="reportstocks-input remove-damaged"
                                                      value={editValues[item.id]?.removeDamaged || ''}
                                                      onChange={(e) => handleInputChange(item.id, 'removeDamaged', e.target.value)}
                                                      disabled={isEditing && !editValues[item.id]?.removeDamaged}
                                                  />
                                              </div>
                                          </td>
                                          <td>
                                              <div className="reportstocks-actionrow">
                                                  <div className="reportstocks-actionbtns">
                                                      <button 
                                                          className="btn btn-small reportstocks-btn"
                                                          onClick={() => handleSave(item)}
                                                          disabled={!isEditing}
                                                      >
                                                          Save
                                                      </button>
                                                      <button 
                                                          className="btn btn-small reportstocks-btn"
                                                          onClick={() => handleCancel(item.id)}
                                                          disabled={!isEditing}
                                                      >
                                                          Cancel
                                                      </button>
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};


export default ReportsStocks;