import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './Dashboard.css';
import { useAuth } from '../../AuthProvider';
import { API_BASE_URL } from '../../config';
import { ChevronDown } from 'lucide-react'; 
import { useData } from '../../contexts/DataProvider';

const Dashboard = () => {
    const { profile, session } = useAuth();
    const { items: globalItems, totalInventoryValue: globalTotalValue, refreshData } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- State ---
    const [filter, setFilter] = useState('week'); 
    const [stats, setStats] = useState({
        totalItems: 0,
        newItems: 0,
        damagedItems: 0,
        totalSales: 0,
        lowStockCount: 0,
        lowStockList: [],
        totalInventoryValue: 0,
        priceUpdates: 0,
        salesData: {}, 
    });
    const [loading, setLoading] = useState(true);

    // --- Helper to calculate date threshold based on filter ---
    const getDateRange = (currentFilter) => {
        const date = new Date();
        if (currentFilter === 'day') date.setDate(date.getDate() - 1);
        else if (currentFilter === 'week') date.setDate(date.getDate() - 7);
        else if (currentFilter === 'month') date.setMonth(date.getMonth() - 1);
        date.setHours(0, 0, 0, 0);
        return date;
    };


    // --- Data Fetching Logic ---
    const fetchDashboardData = useCallback(async () => {
        if (!session) return;
        setLoading(true);

        const headers = { 'Authorization': `Bearer ${session.access_token}` };
        const salesUrl = `${API_BASE_URL}/reports/sales?filter=${filter}`;
        
        const fetchPromises = [
            fetch(salesUrl, { headers }).then(res => res.json()), 
            // Removed items fetch, use globalItems
            fetch(`${API_BASE_URL}/items/low-stock`, { headers }).then(res => res.json()), 
        ];

        try {
            const [salesReport, lowStockList] = await Promise.all(fetchPromises);
            const safeAllItems = globalItems || [];
            const totalInventoryValue = globalTotalValue || 0;
            
            const dateThreshold = getDateRange(filter);

            const damagedItems = safeAllItems.filter(item => item.damaged_quantity > 0);
            const newItems = safeAllItems.filter(item => {
                const dateAdded = new Date(item.date_added);
                return dateAdded >= dateThreshold;
            });
            const newPriceUpdates = safeAllItems.filter(item => {
                if (!item.price_last_update) return false; 
                const priceUpdatedDate = new Date(item.price_last_update);
                priceUpdatedDate.setHours(0, 0, 0, 0);
                return priceUpdatedDate >= dateThreshold;
            });
            
            // 2. Aggregate final stats
            setStats({
                totalItems: safeAllItems.length,
                newItems: newItems.length,
                damagedItems: damagedItems.length,
                priceUpdates: newPriceUpdates.length,
                
                // --- Metrics from Sales Report (Filtered) ---
                totalSales: salesReport.total_revenue || 0, 
                salesData: salesReport, 
                
                lowStockCount: lowStockList.length,
                lowStockList: lowStockList,
                totalInventoryValue: totalInventoryValue,
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [session, filter, globalItems, globalTotalValue]);

    useEffect(() => {
        refreshData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData, location.key]);

    
    if (loading || !profile) {
        return (
            <Layout title="Dashboard">
                <div className="welcome-card"><h2 className="welcome-title">Loading Dashboard...</h2></div>
            </Layout>
        );
    }

    const handleGenerateReport = async () => {
        if(!session || !session.user || !session.user.email) {
            alert("No user email found. Please ensure you are logged in correctly.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ email: session.user.email })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || "Report generation started!");
            } else {
                const errorData = await response.json();
                alert(`Failed to generate report: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error generating report:", error);
            alert("An error occurred while generating the report.");
        }
    };
    
    // Derived values for clean rendering
    const topSalesItem = stats.salesData?.top_items?.[0]?.name || 'N/A';
    const totalRevenueDisplay = `₱${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return (
        <Layout title="Dashboard">
            {/* Welcome Banner */}
            <div className="welcome-card">
                <h2 className="welcome-title">Welcome back, {profile.first_name}!</h2>
                <button onClick={handleGenerateReport}>
                    <p>Generate Week Report</p>
                </button>
            </div>
            
            {/* Filter Dropdown Row */}
            <div className='dashboard-filter-row'>
                <div className="reportsales-dropdownwrap">
                    <select 
                        className="reportsales-dropdown" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="month">Last 30 Days</option>  
                        <option value="week">Last 7 Days</option>
                        <option value="day">Last 24 Hours</option>
                    </select>
                    <ChevronDown className="reportsales-dropdown-icon" size={16} />
                </div>
            </div>


            {/* First Row - Stats Cards */}
            <div className="first-row">
                {/* Price Update (Not Dynamic Yet) */}
                <div className='priceUpdate'>
                    <div className='title-section'>
                        <p className='title'>Items with Price Update</p>
                        <span className="arrowIcon" onClick={() => navigate('/pricing')}></span>
                    </div>
                    <div><h3>{stats.priceUpdates}</h3></div>
                    <p className='desc'>Review price changes {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='newItems'>
                    <div className='title-section'>
                        <p className='title'>New Items</p>
                        <span className="arrowIcon" onClick={() => navigate('/inventory/new-items')}></span>
                    </div>
                    <div><h3>{stats.newItems}</h3></div>
                    <p className='desc'>Items added {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='allItems'>
                    <div className='title-section'>
                        <p className='title'>All Items</p>
                        <span className="arrowIcon" onClick={() => navigate('/inventory/all-items')}></span>
                    </div>
                    <div><h3>{stats.totalItems}</h3></div>
                    <p className='desc'>Total items in inventory</p>
                </div>

                <div className='damagedItems'>
                    <div className='title-section'>
                        <p className='title'>Damaged Items</p>
                        <span className="arrowIcon" onClick={() => navigate('/inventory/damaged-items')}></span>
                    </div>
                    <div><h3>{stats.damagedItems}</h3></div>
                    <p className='desc'>Items currently marked as damaged</p>
                </div>
            </div>

            {/* Second Row - Sales Cards */}
            <div className='second-row'>
                <div className='salesCard'>
                    <div className='title-section'>
                        <p className='title'>{filter === 'day' ? 'Today\'s' : filter === 'week' ? 'Weekly' : 'Monthly'} Sales Revenue</p>
                        <span className="arrowIcon" onClick={() => navigate('/reports/sales/sales-revenue')}></span>
                    </div>
                    <div><h3>{totalRevenueDisplay}</h3></div>
                    <p className='desc'>Total revenue {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='revenueGrowthCard'>
                    <div className='title-section'>
                        <p className='title'>Total Inventory Price</p>
                        <span className="arrowIcon" onClick={() => navigate('/inventory/all-items')}></span>
                    </div>
                    <div><h3>₱{stats.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3></div>
                    <p className='desc'>Price of all saleable stock in inventory</p>
                </div>

            </div>

            {/* Third Row */}
            <div className='third-row'>
                <div className='inner-container-lowCards'>
                    <div className='highSaleItemCard'>
                        <div className='title-section'>
                            <p className='title'>Top Selling Item</p>
                            <span className="arrowIcon" onClick={() => navigate('/reports/sales/sales-revenue')}></span>
                        </div>
                        <div><h3>{topSalesItem}</h3></div>
                        <p className='desc'>Best performing item by revenue</p>
                    </div>

                    <div className='lowStockCard'>
                        <div className='title-section'>
                            <p className='title'>Low Stock Items</p>
                            <span className="arrowIcon" onClick={() => navigate('/reports/stocks')}></span>
                        </div>
                        <div><h3>{stats.lowStockCount}</h3></div>
                        <p className='desc'>Total items below threshold (5)</p>
                    </div>
                </div>

                {/* Item List Table (Low Stock List) */}
                <div className="items-list-container">
                    <table className="ItemsListCard">
                        <thead className='itemListHeader'>
                            <tr>
                                <th className="card-title">Low Stock Items</th>
                                <th className='quantity'>Quantity Left</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.isArray(stats.lowStockList) && stats.lowStockList.map((item, index) => (
                                <tr key={index} className="item-row">
                                    <td>{item.item_name}</td>
                                    <td>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button 
                        type="button" 
                        className="plusIconBtn" 
                        aria-label="Add new item" 
                        onClick={() => navigate('/reports/add-delete-update')}
                    >
                        <span className="plusIcon" />
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;