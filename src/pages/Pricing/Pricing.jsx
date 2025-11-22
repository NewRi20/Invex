import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search } from 'lucide-react';
import './Pricing.css';
import { useAuth } from '../../AuthProvider';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Format ISO/date strings to a human-friendly date + time
  const formatDateTime = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value; // fallback to original
      return d.toLocaleString(); // respects user's locale, includes date and time
    } catch (e) {
      return value;
    }
  };

  // --- 1. Fetch Items ---
  useEffect(() => {
    if (session) {
      fetchItems();
    }
  }, [session]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items/`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const itemList = Array.isArray(data.items) ? data.items : [];
        setItems(itemList);
        setFilteredItems(itemList);
      } else {
             // Handle server error responses (e.g., 500)
             const errorBody = await response.json().catch(() => ({ message: 'Server error' }));
             console.error("API Error:", errorBody.message);
             setItems([]);
             setFilteredItems([]);
        }
    } catch (error) {
      console.error("Network Error fetching items:", error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Search ---
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = items.filter(item => 
      item.item_name.toLowerCase().includes(query)
    );
    setFilteredItems(filtered);
  };

  // --- 3. Handle Item Selection ---
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setNewPrice(item.price); // Pre-fill the new price input
  };

  // --- 4. Handle Price Update ---
  const handleUpdatePrice = async () => {
    if (!selectedItem || !newPrice) return;

    try {
      const response = await fetch(`${API_BASE_URL}/items/${selectedItem.id}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ price: newPrice.toString() })
      });

      if (!response.ok) throw new Error('Failed to update price');

      alert('Price updated successfully!');
      fetchItems(); 
      setSelectedItem(null);
      setNewPrice('');
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price.");
    }
  };

  return (
    <Layout title="Pricing">
      <div className="pricing-page">
        <div className="pricing-header">
          <h2 className="pricing-title">Pricing</h2>
        </div>

        <div className="grid grid-2">
          
          {/* --- LEFT COLUMN: Pricing List --- */}
          <div className="pricing-card">
            <h3 className="section-title">Pricing List</h3>

            {/* Search Bar */}
            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search items..."
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="search-icon" />
            </div>

            {/* Table Headers */}
            <div className="pricing-header-row">
              <div style={{flex: 2}}>Name</div>
              <div className="text-center" style={{flex: 1}}>Price</div>
              <div className="text-right" style={{flex: 1}}>Last Update</div>
            </div>

            {/* Table Data */}
            <div className="pricing-list">
              {loading ? (
                <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center'}}>No items found</div>
              ) : (
                filteredItems
                  .slice()
                  .sort((a, b) => {
                    const aDate = new Date(a.price_last_update || a.date_added);
                    const bDate = new Date(b.price_last_update || b.date_added);
                    return bDate - aDate;
                  })
                  .map((item) => (
                  <div 
                    key={item.id} 
                    className={`pricing-row ${selectedItem?.id === item.id ? 'active' : ''}`}
                    onClick={() => handleSelectItem(item)}
                    style={{cursor: 'pointer'}}
                  >
                    <div style={{flex: 2}}>{item.item_name}</div>
                    <div className="text-center" style={{flex: 1}}>₱{item.price}</div>
                    <div className="text-right" style={{flex: 1, fontSize: '12px'}}>{formatDateTime(item.price_last_update || item.date_added)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Pricing Details Form --- */}
          <div className="pricing-card">
            <h3 className="section-title">Pricing Details</h3>

            {selectedItem ? (
              <>
                <div className="form-group">
                  <label className="label">Product's Name:</label>
                  <div className="readonly-field">{selectedItem.item_name}</div>
                </div>

                <div className="form-group">
                  <label className="label">Current Price:</label>
                  <div className="readonly-field">₱{selectedItem.price}</div>
                </div>

                <div className="form-group">
                    <label className="label">Last Updated:</label>
                    <div className="readonly-field">
                        {formatDateTime(selectedItem.price_last_update || selectedItem.date_added)}
                    </div>
                </div>

                <div className="form-group form-group-lg">
                  <label className="label">New Price:</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="inputNewPrice"
                    placeholder="Enter new price"
                  />
                </div>

                <button className="confirm-Btn" onClick={handleUpdatePrice}>
                  Confirm Update
                </button>
              </>
            ) : (
              <div style={{padding: '40px', textAlign: 'center', opacity: 0.6}}>
                <p>Select an item from the list to edit its price.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;