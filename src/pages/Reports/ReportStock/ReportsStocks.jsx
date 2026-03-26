import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../../AuthProvider';
import { API_BASE_URL } from '../../../config'; // Import Auth

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
            const response = await fetch(`${API_BASE_URL}/items/`, {
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
            const response = await fetch(`${API_BASE_URL}/items/${itemId}/stock`, {
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
            <div className="p-5 bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] mb-5">
                <div className="flex flex-col md:flex-row items-center bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] p-5 mb-5 rounded-[20px] gap-3 md:gap-0">
                    <h2 className="text-lg font-bold whitespace-nowrap mr-auto">Stocks Management</h2>
                    <div className="flex items-center w-full md:w-auto border border-[var(--white-blue-text)] rounded-[10px] ml-0 md:ml-5 text-[var(--white-blue-text)]">
                        <input
                            type="text"
                            placeholder="Search Name or Category"
                            className="p-2.5 bg-transparent border-none outline-none text-[var(--white-blue-text)] flex-1 min-w-0 placeholder:text-[var(--white-blue-text)]/50 focus:ring-0"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <Search size={20} className="h-5 w-5 mx-1.5 text-[var(--white-blue-text)]" />
                    </div>
                </div>
                
                <div className="bg-white rounded-[var(--border-radius)] p-0 overflow-y-auto max-h-[300px] md:max-h-[400px] sm:max-h-none sm:overflow-visible overflow-x-visible">
                    <table className="table w-full block md:table">
                        <thead className="hidden md:table-header-group">
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
                        <tbody className="block md:table-row-group">
                            {filteredItems.length === 0 ? (
                                <tr className="block md:table-row"><td colSpan="7" style={{textAlign: 'center'}} className="block md:table-cell text-center p-4">No items matching search criteria.</td></tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isEditing = !!editValues[item.id];
                                    return (
                                      <tr key={item.id} className="block md:table-row mb-3 md:mb-0 bg-white md:bg-transparent p-3 md:p-0 rounded-[10px] md:rounded-none shadow md:shadow-none border-b md:border-b-0 border-gray-200">
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Code</span>
                                              {String(item.id).substring(0, 8)}...
                                          </td>
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Name</span>
                                              {item.item_name}
                                          </td>
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Category</span>
                                              {item.categoryName}
                                          </td>
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Current</span>
                                              {item.quantity}
                                          </td>
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Damaged</span>
                                              {item.damaged_quantity}
                                          </td> 
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Adjustments</span>
                                              <div className="flex gap-2 items-center flex-wrap flex-col sm:flex-row w-full md:w-auto">
                                                  <input 
                                                      type="number" 
                                                      placeholder="Add Stock (+)" 
                                                      className="py-1.5 px-2 border border-[#E0E0E0] rounded text-xs w-full sm:w-[120px] flex-1 min-w-[100px] focus:outline-none focus:border-[var(--primary-bg)] disabled:opacity-50"
                                                      value={editValues[item.id]?.addStock || ''}
                                                      onChange={(e) => handleInputChange(item.id, 'addStock', e.target.value)}
                                                      disabled={isEditing && !editValues[item.id]?.addStock}
                                                  />
                                                  <input 
                                                      type="number" 
                                                      placeholder="Remove Damaged (-)" 
                                                      className="py-1.5 px-2 border border-[#E0E0E0] rounded text-xs w-full sm:w-[120px] flex-1 min-w-[100px] focus:outline-none focus:border-[var(--primary-bg)] disabled:opacity-50"
                                                      value={editValues[item.id]?.removeDamaged || ''}
                                                      onChange={(e) => handleInputChange(item.id, 'removeDamaged', e.target.value)}
                                                      disabled={isEditing && !editValues[item.id]?.removeDamaged}
                                                  />
                                              </div>
                                          </td>
                                          <td className="flex md:table-cell flex-row items-center gap-2 py-1.5 md:py-3 px-0 md:px-2 border-none md:border text-sm sticky right-0 bg-white md:bg-transparent z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.04)] md:shadow-none">
                                              <span className="font-semibold mr-2 w-[90px] inline-block md:hidden whitespace-nowrap text-gray-700">Actions</span>
                                              <div className="flex gap-2 items-center flex-wrap w-full md:w-auto">
                                                  <div className="flex gap-1 flex-wrap w-full">
                                                      <button 
                                                          className="btn btn-small text-[var(--white-blue-text)] px-2 py-1 text-[10px] whitespace-nowrap bg-[var(--Btn-bg-blue)] hover:bg-[var(--Btn-bg-blue-light)] rounded flex-1 md:flex-none disabled:opacity-50"
                                                          onClick={() => handleSave(item)}
                                                          disabled={!isEditing}
                                                      >
                                                          Save
                                                      </button>
                                                      <button 
                                                          className="btn btn-small text-[var(--white-blue-text)] px-2 py-1 text-[10px] whitespace-nowrap bg-[var(--Btn-bg-blue)] hover:bg-[var(--Btn-bg-blue-light)] rounded flex-1 md:flex-none disabled:opacity-50"
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
