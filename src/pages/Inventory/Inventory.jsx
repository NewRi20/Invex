import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';
import { API_BASE_URL } from '../../config';
import { Search } from 'lucide-react'; 
import { useData } from '../../contexts/DataProvider';

const Inventory = () => {
    const { session } = useAuth();
    const { items: allItems, categories, loading, refreshData } = useData();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all-items');
    const [searchQuery, setSearchQuery] = useState('');

    
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Use shared data, but can trigger refresh if needed
    useEffect(() => {
        refreshData();
    }, []); 

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-3 w-full max-w-full">
                {summaryCardId.map((card) => {
                    const key = card.path.split('/').pop();
                    const isActive = activeTab === key;
                    return (
                        <Link
                            key={card.id}
                            to={card.path}
                            className={`block rounded-[20px] p-4 cursor-pointer no-underline transition-colors ${
                                isActive 
                                ? 'bg-[var(--secondary-bg)] text-[var(--primary-bg)]' 
                                : 'bg-[var(--card-bg)] text-[var(--primary-bg)]'
                            }`}
                        >
                            <h3 className="text-base font-semibold mb-2">{card.title}</h3>
                            <p className="text-sm opacity-80">{card.description}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Inventory Table */}
            <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] p-2.5 overflow-x-auto w-full">
                {activeTab !== 'categories' && (
                    <div className="flex items-center mb-3 w-full sm:w-[45%] lg:w-[30%] border border-black/10 rounded-lg px-2">
                        <input
                            type="text"
                            placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                            className="flex-1 border-none outline-none py-2 bg-transparent text-inherit"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <Search size={20} className="ml-2 text-current opacity-60" />
                    </div>
                )}
                
                <table className="w-full border-collapse min-w-[600px] mb-2">
                    <thead>
                        {activeTab === 'categories' ? (
                            <tr>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap">Category Name</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap">Item Code</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap">Item Name</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap">Category</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap">Quantity Left</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap hidden sm:table-cell">Price</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap hidden md:table-cell">Unit Sold</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap hidden lg:table-cell">Damaged Quantity</th>
                                <th className="text-left p-3 font-semibold border-b border-black/10 whitespace-nowrap hidden lg:table-cell">Date Added</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {/* --- RENDER CATEGORIES --- */}
                        {activeTab === 'categories' ? (
                            categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap last:border-b-0">{cat.name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="2" style={{textAlign:'center'}} className="p-3">No categories found</td></tr>
                            )
                        ) : (
                            /* --- RENDER ITEMS (Filtered by Search) --- */
                            (() => {
                                if (dataToShow.length === 0) {
                                    const message = searchQuery ? `No items found matching "${searchQuery}"` : "No items found.";
                                    return <tr><td colSpan="8" style={{textAlign:'center'}} className="p-3">{message}</td></tr>;
                                }

                                // Render items sorted by newest `date_added` first
                                return dataToShow
                                .slice()
                                .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
                                .map((item) => (
                                    <tr key={item.id} className="last:border-b-0">
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap font-mono text-xs">{String(item.id).substring(0, 8)}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap">{item.item_name}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap">{item.item_category?.name || 'Uncategorized'}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap">{item.quantity}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap hidden sm:table-cell">₱{item.price}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap hidden md:table-cell">{item.unit_sold}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap hidden lg:table-cell">{item.damaged_quantity}</td>
                                        <td className="p-3 border-b border-black/5 whitespace-nowrap hidden lg:table-cell">{item.date_added}</td>
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