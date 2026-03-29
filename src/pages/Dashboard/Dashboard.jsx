import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../AuthProvider';
import { API_BASE_URL } from '../../config';
import { ChevronDown } from 'lucide-react'; 
import { useData } from '../../contexts/DataProvider';
import LowStockReminder from '../../components/LowStockReminder/LowStockReminder';

const DASHBOARD_CACHE_TTL_MS = 60 * 1000;
const dashboardDataCache = new Map();

// Arrow Icon Component
const ArrowIcon = ({ onClick }) => (
    <div onClick={onClick} className="w-10 h-10 rotate-30 cursor-pointer text-current flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="w-full h-full fill-current">
            <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17m0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15"/>
            <path d="M33.3 26.7L25 18.4l-8.3 8.3l-1.4-1.4l9.7-9.7l9.7 9.7z"/>
            <path d="M24 17h2v17h-2z"/>
        </svg>
    </div>
);

const Dashboard = () => {
    const { profile, session } = useAuth();
    const { items: globalItems, totalInventoryValue: globalTotalValue, refreshData } = useData();
    const navigate = useNavigate();
    
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

        const cacheKey = `${session.user?.id || 'anonymous'}:${filter}`;
        const cachedEntry = dashboardDataCache.get(cacheKey);

        if (cachedEntry?.data && (Date.now() - cachedEntry.timestamp < DASHBOARD_CACHE_TTL_MS)) {
            setStats(prev => ({
                ...prev,
                totalSales: cachedEntry.data.totalSales,
                salesData: cachedEntry.data.salesData,
                lowStockCount: cachedEntry.data.lowStockCount,
                lowStockList: cachedEntry.data.lowStockList,
            }));
            setLoading(false);
            return;
        }

        if (cachedEntry?.inFlightPromise) {
            setLoading(true);
            try {
                const inFlightData = await cachedEntry.inFlightPromise;
                setStats(prev => ({
                    ...prev,
                    totalSales: inFlightData.totalSales,
                    salesData: inFlightData.salesData,
                    lowStockCount: inFlightData.lowStockCount,
                    lowStockList: inFlightData.lowStockList,
                }));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);

        const headers = { 'Authorization': `Bearer ${session.access_token}` };
        const salesUrl = `${API_BASE_URL}/reports/sales?filter=${filter}`;

        const requestPromise = Promise.all([
            fetch(salesUrl, { headers }).then(res => res.json()),
            fetch(`${API_BASE_URL}/items/low-stock`, { headers }).then(res => res.json()),
        ]).then(([salesReport, lowStockList]) => ({
            totalSales: salesReport.total_revenue || 0,
            salesData: salesReport,
            lowStockCount: lowStockList.length,
            lowStockList,
        }));

        dashboardDataCache.set(cacheKey, {
            data: cachedEntry?.data || null,
            timestamp: cachedEntry?.timestamp || 0,
            inFlightPromise: requestPromise,
        });

        try {
            const nextData = await requestPromise;

            dashboardDataCache.set(cacheKey, {
                data: nextData,
                timestamp: Date.now(),
                inFlightPromise: null,
            });

            setStats(prev => ({
                ...prev,
                totalSales: nextData.totalSales,
                salesData: nextData.salesData,
                lowStockCount: nextData.lowStockCount,
                lowStockList: nextData.lowStockList,
            }));

        } catch (error) {
            dashboardDataCache.delete(cacheKey);
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [session, filter]);

    useEffect(() => {
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

        setStats(prev => ({
            ...prev,
            totalItems: safeAllItems.length,
            newItems: newItems.length,
            damagedItems: damagedItems.length,
            priceUpdates: newPriceUpdates.length,
            totalInventoryValue: totalInventoryValue,
        }));
    }, [globalItems, globalTotalValue, filter]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    
    if (loading || !profile) {
        return (
            <Layout title="Dashboard">
                <div className="flex justify-between items-center bg-[var(--blue-accent)] text-[var(--primary-bg-blue)] p-5 mb-5 rounded-[20px]">
                    <h2 className="text-xl font-bold text-[var(--primary-bg)]">Loading Dashboard...</h2>
                </div>
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
            <LowStockReminder lowStockCount={stats.lowStockCount} />
            {/* Welcome Banner */}
            <div className="flex justify-between items-center bg-[var(--blue-accent)] text-[var(--primary-bg-blue)] p-5 mb-5 rounded-[20px]">
                <h2 className="text-xl font-bold text-[var(--primary-bg)]">Welcome back, {profile.first_name}!</h2>
                <button 
                    onClick={handleGenerateReport}
                    className="bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none rounded-[10px] px-[15px] py-[10px] cursor-pointer text-sm"
                >
                    <p>Generate Week Report</p>
                </button>
            </div>
            
            {/* Filter Dropdown Row */}
            <div className='flex justify-end mb-5 relative'>
                <div className="relative inline-flex items-center">
                    <select 
                        className="appearance-none bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] border-none rounded-[10px] py-[10px] pl-[15px] pr-[35px] cursor-pointer text-sm outline-none"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="month">Last 30 Days</option>  
                        <option value="week">Last 7 Days</option>
                        <option value="day">Last 24 Hours</option>
                    </select>
                    <ChevronDown className="absolute right-[10px] text-[var(--white-blue-text)] pointer-events-none" size={16} />
                </div>
            </div>


            {/* First Row - Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                {/* Price Update (Not Dynamic Yet) */}
                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--secondary-bg)] text-[var(--primary-bg)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>Items with Price Update</p>
                        <ArrowIcon onClick={() => navigate('/pricing')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{stats.priceUpdates}</h3></div>
                    <p className='text-xs opacity-80'>Review price changes {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--card-bg)] text-[var(--primary-bg)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>New Items</p>
                        <ArrowIcon onClick={() => navigate('/inventory/new-items')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{stats.newItems}</h3></div>
                    <p className='text-xs opacity-80'>Items added {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--card-bg)] text-[var(--primary-bg)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>All Items</p>
                        <ArrowIcon onClick={() => navigate('/inventory/all-items')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{stats.totalItems}</h3></div>
                    <p className='text-xs opacity-80'>Total items in inventory</p>
                </div>

                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--card-bg)] text-[var(--primary-bg)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>Damaged Items</p>
                        <ArrowIcon onClick={() => navigate('/inventory/damaged-items')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{stats.damagedItems}</h3></div>
                    <p className='text-xs opacity-80'>Items currently marked as damaged</p>
                </div>
            </div>

            {/* Second Row - Sales Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>{filter === 'day' ? 'Today\'s' : filter === 'week' ? 'Weekly' : 'Monthly'} Sales Revenue</p>
                        <ArrowIcon onClick={() => navigate('/reports/sales/sales-revenue')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{totalRevenueDisplay}</h3></div>
                    <p className='text-xs opacity-80'>Total revenue {filter === 'day' ? 'today' : filter === 'week' ? 'this week' : 'this month'}</p>
                </div>

                <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 mb-5 bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)]'>
                    <div className='flex items-center justify-between -mt-2.5'>
                        <p className='text-base font-normal whitespace-nowrap'>Total Inventory Price</p>
                        <ArrowIcon onClick={() => navigate('/inventory/all-items')} />
                    </div>
                    <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">₱{stats.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3></div>
                    <p className='text-xs opacity-80'>Price of all saleable stock in inventory</p>
                </div>

            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 lg:mb-0">
                    <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 bg-[var(--secondary-bg)] text-[var(--primary-bg)]'>
                        <div className='flex items-center justify-between -mt-2.5'>
                            <p className='text-base font-normal whitespace-nowrap'>Top Selling Item</p>
                            <ArrowIcon onClick={() => navigate('/reports/sales/sales-revenue')} />
                        </div>
                        <div><h3 className="w-full text-[2rem] font-semibold my-5 mx-0 sm:mx-[10px_0]">{topSalesItem}</h3></div>
                        <p className='text-xs opacity-80'>Best performing item by revenue</p>
                    </div>

                    <div className='h-[200px] flex flex-col justify-center rounded-[20px] px-5 py-2.5 bg-[var(--secondary-bg)] text-[var(--primary-bg)]'>
                        <div className='flex items-center justify-between -mt-2.5'>
                            <p className='text-base font-normal whitespace-nowrap'>Low Stock Items</p>
                            <ArrowIcon onClick={() => navigate('/reports/stocks')} />
                        </div>
                        <div><h3 className="w-full text-[50px] sm:text-[70px] font-semibold mb-1 leading-none">{stats.lowStockCount}</h3></div>
                        <p className='text-xs opacity-80'>Total items below threshold (5)</p>
                    </div>
                </div>

                {/* Item List Table (Low Stock List) */}
                <div className="relative">
                    <div className="relative h-[200px] max-h-[200px] overflow-y-auto flex flex-col justify-start rounded-[20px] px-[15px] py-5 bg-[var(--card-bg)] text-[var(--primary-bg)] mb-5">
                       <table className="w-full border-collapse">
                            <thead>
                                <tr className="grid grid-cols-[2fr_1fr] items-center text-left font-semibold pb-2 border-b border-black/10">
                                    <th>Low Stock Items</th>
                                    <th>Quantity Left</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.isArray(stats.lowStockList) && stats.lowStockList.map((item, index) => (
                                    <tr key={index} className="grid grid-cols-[2fr_1fr] items-center text-sm py-1">
                                        <td>{item.item_name}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button 
                        type="button" 
                        className="absolute bottom-5 -right-2.5 w-[50px] h-[50px] rounded-full border-none shadow-lg cursor-pointer flex items-center justify-center overflow-hidden bg-[var(--secondary-bg)]"
                        aria-label="Add new item" 
                        onClick={() => navigate('/reports/add-delete-update')}
                    >
                        <span className="w-7 h-7 inline-block">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full fill-[var(--primary-bg)]">
                                <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
                             </svg>
                        </span>
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;