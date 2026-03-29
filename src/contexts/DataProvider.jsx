import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import { API_BASE_URL } from '../config';

const DataContext = createContext();

const DATA_CACHE_TTL_MS = 5 * 60 * 1000;

// Module-level cache survives StrictMode remounts in development.
const sharedDataCache = {
    lastFetched: 0,
    items: [],
    totalInventoryValue: 0,
    categories: [],
    inFlightPromise: null,
    token: null,
};

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { session } = useAuth();
    const [items, setItems] = useState([]);
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState(null);

    const refreshData = useCallback(async (force = false) => {
        if (!session) return;

        const token = session.access_token;
        if (sharedDataCache.token !== token) {
            sharedDataCache.token = token;
            sharedDataCache.lastFetched = 0;
            sharedDataCache.items = [];
            sharedDataCache.totalInventoryValue = 0;
            sharedDataCache.categories = [];
            sharedDataCache.inFlightPromise = null;
        }
        
        if (!force && sharedDataCache.inFlightPromise) {
            await sharedDataCache.inFlightPromise;
            return;
        }

        if (
            !force &&
            sharedDataCache.lastFetched &&
            (Date.now() - sharedDataCache.lastFetched < DATA_CACHE_TTL_MS)
        ) {
            setItems(sharedDataCache.items);
            setTotalInventoryValue(sharedDataCache.totalInventoryValue);
            setCategories(sharedDataCache.categories);
            setLastFetched(sharedDataCache.lastFetched);
            return;
        }

        setLoading(true);
        const requestPromise = (async () => {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [itemsRes, catRes] = await Promise.all([
                fetch(`${API_BASE_URL}/items/`, { headers }),
                fetch(`${API_BASE_URL}/items/categories`, { headers })
            ]);

            const nextItems = itemsRes.ok
                ? (() => {
                    const parsed = itemsRes.json();
                    return parsed;
                })()
                : null;

            const nextCategories = catRes.ok
                ? (() => {
                    const parsed = catRes.json();
                    return parsed;
                })()
                : null;

            const [itemsData, catData] = await Promise.all([
                nextItems,
                nextCategories,
            ]);

            const normalizedItems = Array.isArray(itemsData?.items) ? itemsData.items : [];
            const normalizedValue = itemsData?.totalInventoryValue || 0;
            const normalizedCategories = Array.isArray(catData) ? catData : [];
            const fetchedAt = Date.now();

            sharedDataCache.items = normalizedItems;
            sharedDataCache.totalInventoryValue = normalizedValue;
            sharedDataCache.categories = normalizedCategories;
            sharedDataCache.lastFetched = fetchedAt;

            setItems(normalizedItems);
            setTotalInventoryValue(normalizedValue);
            setCategories(normalizedCategories);
            setLastFetched(fetchedAt);
        })();

        sharedDataCache.inFlightPromise = requestPromise;

        try {
            await requestPromise;
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            sharedDataCache.inFlightPromise = null;
            setLoading(false);
        }
    }, [session]);

    // Initial fetch when session is available
    useEffect(() => {
        if (session) {
            refreshData();
        }
    }, [session, refreshData]);

    return (
        <DataContext.Provider value={{ items, totalInventoryValue, categories, loading, refreshData }}>
            {children}
        </DataContext.Provider>
    );
};
