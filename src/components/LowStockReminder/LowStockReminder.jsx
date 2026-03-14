import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './LowStockReminder.css';

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
        <div className="low-stock-overlay">
            <div className="low-stock-modal">
                <div className="low-stock-header">
                    <h3>Low Stock Alert</h3>
                    <button onClick={handleDismiss} className="close-btn" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                <div className="low-stock-content">
                    <p>
                        You have <span className="highlight-count">{lowStockCount} items</span> running low on stock.
                    </p>
                    <p>
                        A detailed restock guide has been sent to your email with the list of items that need attention.
                    </p>
                </div>
                <div className="low-stock-actions">
                    <button onClick={handleDismiss} className="dismiss-btn">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowStockReminder;
