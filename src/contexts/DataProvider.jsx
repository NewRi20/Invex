import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { API_BASE_URL } from '../config';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { session } = useAuth();
    const [items, setItems] = useState([]);
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);

    // Fetch data only if it hasn't been fetched recently (e.g., in the last 5 minutes)
    const refreshData = async (force = false) => {
        if (!session) return;
        
        // If we have data and it's less than 5 minutes old, don't re-fetch unless forced
        const fiveMinutes = 1 * 60 * 1000;
        if (!force && lastFetched && (Date.now() - lastFetched < fiveMinutes)) {
            return;
        }

        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${session.access_token}` };
            
            const [itemsRes, catRes] = await Promise.all([
                fetch(`${API_BASE_URL}/items/`, { headers }),
                fetch(`${API_BASE_URL}/items/categories`, { headers })
            ]);

            if (itemsRes.ok) {
                const itemsData = await itemsRes.json();
                setItems(Array.isArray(itemsData.items) ? itemsData.items : []);
                setTotalInventoryValue(itemsData.totalInventoryValue || 0);
            }
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);
            }
            setLastFetched(Date.now());
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch when session is available
    useEffect(() => {
        if (session) {
            refreshData();
        }
    }, [session]);

    return (
        <DataContext.Provider value={{ items, totalInventoryValue, categories, loading, refreshData }}>
            {children}
        </DataContext.Provider>
    );
};
