import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import './Inventory.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';
import { API_BASE_URL } from '../../config';
import { Search } from 'lucide-react'; 

const Inventory = () => {
    const { session } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all-items');
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    
    useEffect(() => {
        if (session) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    
                    const itemsRes = await fetch(`${API_BASE_URL}/items/`, {
                        headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    

                    const catRes = await fetch(`${API_BASE_URL}/items/categories`, {
                        headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    const catData = await catRes.json();

                    if (itemsRes.ok) {
                        const itemsResponse = await itemsRes.json();
                        const itemList = Array.isArray(itemsResponse.items) ? itemsResponse.items : [];
                        setAllItems(itemList);
                    };
                    if (catRes.ok) setCategories(catData);

                } catch (error) {
                    console.error("Error loading inventory:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [session]);

    
    const newItemsData = allItems.filter(item => {
        const dateAdded = new Date(item.date_added);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return dateAdded >= oneWeekAgo;
    });

    const damagedItemsData = allItems.filter(item => item.damaged_quantity > 0);
    
    
    const getVisibleData = () => {
        let sourceData = [];
        if (activeTab === 'new-items') {
            sourceData = newItemsData;
        } else if (activeTab === 'damaged-items') {
            sourceData = damagedItemsData;
        } else {
            sourceData = allItems;
        }

        const query = searchQuery.toLowerCase();
        if (!query) {
            return sourceData;
        }

        return sourceData.filter(item => 
            item.item_name.toLowerCase().includes(query) ||
            String(item.id).toLowerCase().includes(query) || 
            (item.item_category?.name || '').toLowerCase().includes(query)
        );
    };
    
    const dataToShow = getVisibleData(); 

    useEffect(() => {
        if(location.pathname.startsWith('/inventory/')){
            const tab = location.pathname.split('/').pop();
            setActiveTab(tab || 'all-items');
        }
        else if(location.pathname === '/inventory'){
            setActiveTab('all-items');
        }
    }, [location.pathname]);

    const summaryCardId = [
        {id: 1, path:'/inventory/all-items', title: 'All Items', description: 'All item list'},
        {id: 2, path:'/inventory/new-items', title: 'New Items', description: 'Added this week'},
        {id: 3, path:'/inventory/categories', title: 'Categories', description: 'Category list'},
        {id: 4, path:'/inventory/damaged-items', title: 'Damaged Items', description: 'Damage Report'},
    ];

    if (loading) {
        return (
            <Layout title="Inventory">
                <div style={{padding: "20px"}}>Loading Inventory...</div>
            </Layout>
        );
    }

    return (
        <Layout title="Inventory">
            {/* Summary Cards */}
            <div className="summary-grid">
                {summaryCardId.map((card) => {
                    const key = card.path.split('/').pop();
                    return (
                        <Link
                            key={card.id}
                            to={card.path}
                            className={`summary-card ${activeTab === key ? 'active' : ''}`}
                        >
                            <h3 className="title">{card.title}</h3>
                            <p className="desc">{card.description}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Inventory Table */}
            <div className="table-card">
                {activeTab !== 'categories' && (
                    <div className="inventory-search-wrap">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <Search size={20} className="search-icon" />
                    </div>
                )}
                
                <table className="table">
                    <thead>
                        {activeTab === 'categories' ? (
                            <tr>
                                <th>Category Name</th>
                            </tr>
                        ) : (
                            <tr>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Damaged</th>
                                <th>Date Added</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {/* --- RENDER CATEGORIES --- */}
                        {activeTab === 'categories' ? (
                            categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2" style={{textAlign:'center'}}>No categories found</td></tr>
                            )
                        ) : (
                            /* --- RENDER ITEMS (Filtered by Search) --- */
                            (() => {
                                if (dataToShow.length === 0) {
                                    const message = searchQuery ? `No items found matching "${searchQuery}"` : "No items found.";
                                    return <tr><td colSpan="7" style={{textAlign:'center'}}>{message}</td></tr>;
                                }

                                // Render items sorted by newest `date_added` first
                                return dataToShow
                                .slice()
                                .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
                                .map((item) => (
                                    <tr key={item.id}>
                                        <td style={{fontFamily: 'monospace', fontSize: '12px'}}>{String(item.id).substring(0, 8)}</td>
                                        <td>{item.item_name}</td>
                                        <td>{item.item_category?.name || 'Uncategorized'}</td>
                                        <td>{item.quantity}</td>
                                        <td>₱{item.price}</td>
                                        <td>{item.damaged_quantity}</td>
                                        <td>{item.date_added}</td>
                                    </tr>
                                ));
                            })()
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Inventory;