import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search } from 'lucide-react';
import './Pricing.css';
import { useAuth } from '../../AuthProvider';

const Pricing = () => {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Items ---
  useEffect(() => {
    if (session) {
      fetchItems();
    }
  }, [session]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/items/', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
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
      const response = await fetch(`/api/items/${selectedItem.id}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ price: newPrice })
      });

      if (!response.ok) throw new Error('Failed to update price');

      alert('Price updated successfully!');
      
      // Refresh the list to show the new price
      fetchItems(); 
      
      // Reset selection
      setSelectedItem(null);
      setNewPrice('');

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
              <div className="text-right" style={{flex: 1}}>Date Added</div>
            </div>

            {/* Table Data */}
            <div className="pricing-list">
              {loading ? (
                <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center'}}>No items found</div>
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`pricing-row ${selectedItem?.id === item.id ? 'active' : ''}`}
                    onClick={() => handleSelectItem(item)}
                    style={{cursor: 'pointer'}}
                  >
                    <div style={{flex: 2}}>{item.item_name}</div>
                    <div className="text-center" style={{flex: 1}}>₱{item.price}</div>
                    <div className="text-right" style={{flex: 1, fontSize: '12px'}}>{item.date_added}</div>
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