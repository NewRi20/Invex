import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search } from 'lucide-react';
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

  // --- 5. Run Pricing Job ---
  const handleRunPricingJob = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/items/run-pricing-job`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Pricing job completed successfully!");
        fetchItems(); // Refresh data
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error running pricing job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const itemList = Array.isArray(data.items) ? data.items : [];
        setItems(itemList);
        setFilteredItems(itemList);
      } else {
        // Handle server error responses (e.g., 500)
        const errorBody = await response
          .json()
          .catch(() => ({ message: 'Server error' }));
        console.error('API Error:', errorBody.message);
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Network Error fetching items:', error);
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

    const filtered = items.filter((item) =>
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
      const response = await fetch(
        `${API_BASE_URL}/items/${selectedItem.id}/price`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ price: newPrice.toString() }),
        }
      );

      if (!response.ok) throw new Error('Failed to update price');

      alert('Price updated successfully!');
      fetchItems();
      setSelectedItem(null);
      setNewPrice('');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Failed to update price.');
    }
  };

  return (
    <Layout title="Pricing">
      <div className="grid grid-rows-[auto_1fr] gap-5 h-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-[var(--secondary-bg)] text-[var(--primary-bg)] p-5 rounded-2xl">
          <h2 className="text-xl font-bold">Pricing</h2>
          <button
            className="px-5 py-2.5 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600 ml-5 transition-colors font-medium border-none cursor-pointer"
            onClick={handleRunPricingJob}
          >
            Run Smart Pricing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
          {/* --- LEFT COLUMN: Pricing List --- */}
          <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 rounded-2xl overflow-y-auto h-full flex flex-col">
            <h3 className="text-base font-semibold mb-2.5">Pricing List</h3>

            {/* Search Bar */}
            <div className="flex items-center mb-5 border border-[var(--primary-bg)] rounded-2xl px-2">
              <input
                type="text"
                placeholder="Search items..."
                className="flex-1 border-none outline-none bg-transparent py-2 px-2 text-[var(--primary-bg)]"
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search className="h-5 w-5 text-[var(--primary-bg)] m-[5px]" />
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr] mb-3 font-semibold text-sm items-center px-1">
              <div>Name</div>
              <div className="text-center">Price</div>
              <div className="text-right">Last Update</div>
            </div>

            {/* Table Data */}
            <div className="flex flex-col gap-2 overflow-y-auto">
              {loading ? (
                <div className="p-5 text-center">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="p-5 text-center">No items found</div>
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
                      className={`grid grid-cols-[2fr_1fr_1fr] py-2 px-1 border-b border-[#E0E0E0] items-center gap-2 cursor-pointer transition-colors hover:bg-black/5 ${
                        selectedItem?.id === item.id ? 'bg-black/10' : ''
                      }`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="truncate pr-2">{item.item_name}</div>
                      <div className="text-center">₱{item.price}</div>
                      <div className="text-right text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatDateTime(
                          item.price_last_update || item.date_added
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Pricing Details Form --- */}
          <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 rounded-2xl h-fit">
            <h3 className="text-base font-semibold mb-2.5">Pricing Details</h3>

            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <label className="block font-medium min-w-[120px]">
                    Product's Name:
                  </label>
                  <div className="p-3 bg-[var(--input-bg)] rounded text-sm flex-1 truncate">
                    {selectedItem.item_name}
                  </div>
                </div>

                <div className="flex items-center gap-4 whitespace-nowrap">
                  <label className="block font-medium min-w-[120px]">
                    Current Price:
                  </label>
                  <div className="p-3 bg-[var(--input-bg)] rounded text-sm flex-1">
                    ₱{selectedItem.price}
                  </div>
                </div>

                <div className="flex items-center gap-4 whitespace-nowrap">
                  <label className="block font-medium min-w-[120px]">
                    Last Updated:
                  </label>
                  <div className="p-3 bg-[var(--input-bg)] rounded text-sm flex-1">
                    {formatDateTime(
                      selectedItem.price_last_update || selectedItem.date_added
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 whitespace-nowrap">
                  <label className="block font-medium min-w-[120px]">
                    New Price:
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="p-2.5 bg-[var(--input-bg)] rounded text-sm border border-[var(--primary-bg)] flex-1 focus:outline-none focus:ring-1 focus:ring-[var(--primary-bg)]"
                    placeholder="Enter new price"
                  />
                </div>

                <button
                  className="w-full px-5 py-2.5 bg-[var(--secondary-bg)] text-[var(--text-dark)] font-medium rounded text-sm hover:opacity-90 transition-opacity border-none cursor-pointer mt-4"
                  onClick={handleUpdatePrice}
                >
                  Confirm Update
                </button>
              </div>
            ) : (
              <div className="p-10 text-center opacity-60">
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