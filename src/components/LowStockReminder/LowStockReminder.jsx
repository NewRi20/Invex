import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Package } from 'lucide-react';

const LowStockReminder = ({ lowStockCount, lowStockItems = [] }) => {
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000] backdrop-blur-sm">
            <div className="bg-gray-900 text-white rounded-2xl w-[90%] max-w-[480px] shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-red-400 text-lg font-semibold m-0">Low Stock Alert</h3>
                            <p className="text-gray-500 text-xs m-0 mt-0.5">{lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need attention</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="bg-transparent border-none text-gray-500 cursor-pointer p-1.5 flex items-center justify-center hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Items List */}
                {lowStockItems.length > 0 ? (
                    <div className="px-6 py-3 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                        <div className="flex flex-col gap-2">
                            {lowStockItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5 hover:bg-white/[0.08] transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                            <Package size={15} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-100 m-0">{item.item_name}</p>
                                            <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                                                {item.item_category?.name || 'Uncategorized'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-sm font-bold ${item.quantity <= 2 ? 'text-red-400' : item.quantity <= 5 ? 'text-orange-400' : 'text-yellow-400'}`}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-[10px] text-gray-500">left</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-4">
                        <p className="text-gray-400 text-sm leading-6">
                            You have <span className="font-bold text-red-500">{lowStockCount} items</span> running low on stock.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end items-center px-6 py-4 border-t border-white/5 mt-1">
                    <button
                        onClick={handleDismiss}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 shadow-lg shadow-yellow-400/20"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowStockReminder;
