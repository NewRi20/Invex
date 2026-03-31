import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LowStockReminder = ({ lowStockCount }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show only if there are low stock items and we haven't dismissed it in this session
        const hasSeenReminder = sessionStorage.getItem('seenLowStockReminder');
        if (lowStockCount > 0 && !hasSeenReminder) {
            setIsVisible(true);
        }
    }, [lowStockCount]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('seenLowStockReminder', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[1000]">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-[90%] max-w-[400px] shadow-lg border border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-red-500 text-xl font-semibold m-0">Low Stock Alert</h3>
                    <button onClick={handleDismiss} className="bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center hover:text-white transition-colors duration-200" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mb-6">
                    <p className="mb-3 leading-6 text-gray-200">
                        You have <span className="font-bold text-red-500">{lowStockCount} items</span> running low on stock.
                    </p>
                    <p className="mb-3 leading-6 text-gray-200">
                        A detailed restock guide has been sent to your email with the list of items that need attention.
                    </p>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleDismiss} className="bg-yellow-400 text-black px-4 py-2 rounded font-medium cursor-pointer hover:opacity-90 transition-opacity duration-200">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowStockReminder;
