import { Search, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import './ReportsAddDeleteUpdate.css';
import { useAuth } from '../../../AuthProvider'; 


const ReportsAddDeleteUpdate = () => {
    const { session } = useAuth();

    // --- State ---
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditingId, setIsEditingId] = useState(null); 
    const [editFormData, setEditFormData] = useState({}); 
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // --- Form State for Adding New Item ---
    const [newItemForm, setNewItemForm] = useState({
        name: '', 
        category_id: '', 
        quantity: '',
        price: '',
    });

    // --- Data Fetch ---
    const fetchItems = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            // Fetch All Items for display/editing
            const itemsRes = await fetch('/api/items/', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const itemsData = await itemsRes.json();
            
            // Fetch Categories for the dropdowns
            const catRes = await fetch('/api/items/categories', {
                 headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const catData = await catRes.json();

            const processedData = Array.isArray(itemsData.items)
            ? itemsData.items.map(item => ({
                ...item,
                categoryName: item.item_category?.name || 'Uncategorized',
            }))
            : [];

            setAllItems(processedData);
            setFilteredItems(processedData);
            setCategories(Array.isArray(catData) ? catData : []);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            setAllItems([]); // Reset to empty array on fail
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);
    
    // --- Search Logic ---
    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = allItems.filter(item => 
            item.item_name.toLowerCase().includes(query) ||
            item.categoryName.toLowerCase().includes(query)
        );
        setFilteredItems(filtered);
    }, [searchQuery, allItems]);
    
    // --- Handlers ---
    
    // Handles change in the 'Add Item' form
    const handleNewItemChange = (e) => {
        setNewItemForm({
            ...newItemForm,
            [e.target.name]: e.target.value
        });
    };
    
    // Handles change in the 'Edit' row form
    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };
    
    // 1. Submit New Item
    const handleSaveNewItem = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/items/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    name: newItemForm.name,
                    category_id: parseInt(newItemForm.category_id),
                    quantity: parseInt(newItemForm.quantity),
                    price: parseFloat(newItemForm.price) || 0
                })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to add item');
            }
            
            alert('Item added successfully!');
            setNewItemForm({ name: '', category_id: '', quantity: '' });
            fetchItems();
        } catch (error) {
            alert(`Error adding item: ${error.message}`);
        }
    };
    
    // 2. Start Editing
    const handleRenameClick = (item) => {
        setIsEditingId(item.id);
        const categoryId = item.item_category?.id || '';
        setEditFormData({
            item_name: item.item_name,
            item_category: categoryId,
            price: item.price 
        });
    };
    
    // Save Edit/Rename/Category Change
    const handleSaveChanges = async (itemId) => {
        const priceValue = parseFloat(editFormData.price);
        const payload = {
            item_name: editFormData.item_name,
            item_category: editFormData.item_category 
                ? parseInt(editFormData.item_category, 10) 
                : undefined, 
            price: isNaN(priceValue) ? 0 : priceValue, 
        };

        const cleanedPayload = Object.fromEntries(
            Object.entries(payload).filter(([_, v]) => v !== undefined)
        );

        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                
                body: JSON.stringify(cleanedPayload) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update item');
            }
            
            
            alert('Item updated successfully!');
            setIsEditingId(null);
            fetchItems(); 
        } catch (error) {
            alert(`Update Failed: ${error.message}`);
        }
    };

    //Delete Item
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
        
        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: 'DELETE',
                 headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to delete item');
            }
            
            alert('Item deleted.');
            fetchItems();
        } catch (error) {
            alert(`Deletion Failed: ${error.message}`);
        }
    };
    
    //Cancel Edit
    const handleCancelEdit = () => {
        setIsEditingId(null);
        setEditFormData({});
    };

    // --- New Handler: Submit New Category ---
    const handleSaveNewCategory = async (e) => {
        e.preventDefault();

        const newName = newCategoryName.trim();
        if (!newName) return;

        const normalizedNewName = newName.toLowerCase().replace(/\s/g, '');
        const existingNormalizedNames = categories.map(cat => 
            cat.name.toLowerCase().replace(/\s/g, '')
        );
        
        if (existingNormalizedNames.includes(normalizedNewName)) {
            alert(`Category "${newName}" is too similar to an existing category. Please use a unique name.`);
            return;
        }


        try {
            const response = await fetch('/api/items/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add category');
            }
            
            alert(`Category '${newCategoryName}' added successfully!`);
            setShowCategoryModal(false);
            setNewCategoryName('');
            fetchItems(); 
            
        } catch (error) {
            alert(`Error adding category: ${error.message}`);
        }
    };


    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to permanently delete the category: ${categoryName}? All linked items will become Uncategorized.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/items/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete category.');
            }

            alert(`Category ${categoryName} deleted successfully.`);
            fetchItems(); // Refresh items list and category list
            
        } catch (error) {
            alert(`Deletion Failed: ${error.message}`);
        }
    };

    if (loading) return <div>Loading Inventory...</div>;

    return (
        <>
            {/* Add Item Section */}
            <form className="reportadu-additem" onSubmit={handleSaveNewItem}>
                <h3 className="reportadu-additem-title">Add Item</h3>

                <div className="reportadu-additem-inputs">
                    <input
                        type="text"
                        name="name"
                        value={newItemForm.name}
                        onChange={handleNewItemChange}
                        placeholder="Name"
                        className="input"
                        required
                    />
                    <select
                        name="category_id"
                        value={newItemForm.category_id}
                        onChange={handleNewItemChange}
                        className="input"
                        required
                    >
                        <option value="">Select Category</option>
                        {Array.isArray(categories) && categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        value={newItemForm.quantity}
                        onChange={handleNewItemChange}
                        placeholder="Quantity"
                        className="input"
                        min="1"
                        required
                    />
                     {/* Added Price Input to match backend requirements */}
                    <input
                        type="number"
                        name="price"
                        value={newItemForm.price}
                        onChange={handleNewItemChange}
                        placeholder="Price"
                        className="input"
                        min="0"
                        required
                    />
                </div>

                <div className="reportadu-additem-buttons">
                    <button type="submit" className="btn btn-small reportadu-additem-btn">
                        Save
                    </button>
                    <button type="button" onClick={() => setNewItemForm({ name: '', category_id: '', quantity: '', price: '' })} className="btn btn-small reportadu-additem-btn">
                        Clear
                    </button>
                </div>
            </form>

            {/* --- Category Management List --- */}
            <div className="reportadu-categorylist">
                <div className='manageCatHeader'>
                    <h3 className="reportadu-additem-title">Manage Categories</h3>
                    <div className="reportadu-additem">
                        <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary">
                            Add New Category
                        </button>
                    </div>
                </div>
                
                
                <div className="reportadu-tablewrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(categories) && categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td>{cat.name}</td>
                                        <td className="text-right">
                                            <button 
                                                className="btn btn-small reportadu-action-btn delete-cat-btn"
                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center' }}>No categories created.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            
            {/* <div className="reportadu-additem">
                <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary">
                    Add New Category
                </button>
            </div> */}

            {/* --- Adding New Category Modal --- */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Category</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveNewCategory}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    required
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g., Electronics, Clip Fans"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn btn-small btn-secondary" style={{width: '100%'}}>
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item List Section */}
            <div className="reportadu-itemlist">
                <div className="reportadu-itemlist-header">
                    <h3 className="reportadu-itemlist-title">Item List</h3>

                    {/* Search Bar */}
                    <div className="reportadu-searchwrap">
                        <input
                            type="text"
                            placeholder="Search"
                            className="reportadu-search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={20} className="reportadu-search-icon" />
                    </div>
                </div>

                {/* Item Table */}
                <div className="reportadu-tablewrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Price</th> 
                                <th>Last Modified</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign:'center'}}>No items found.</td></tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isEditing = isEditingId === item.id;
                                    return (
                                        <tr key={item.id}>
                                            <td>{String(item.id).substring(0, 8)}...</td>
                                            
                                            <td>
                                                {isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        name="item_name" 
                                                        value={editFormData.item_name}
                                                        onChange={handleEditChange}
                                                    />
                                                ) : (
                                                    item.item_name
                                                )}
                                            </td>
                                            
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        name="item_category"
                                                        value={editFormData.item_category}
                                                        onChange={handleEditChange}
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    item.categoryName
                                                )}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                {`₱${item.price}`}
                                            </td>
                                            <td>{item.date_added}</td>
                                            <td>
                                                <div className="reportadu-actions">
                                                    {isEditing ? (
                                                        <>
                                                            <button 
                                                                className="btn btn-small reportadu-action-btn"
                                                                onClick={() => handleSaveChanges(item.id)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                className="btn btn-small reportadu-action-btn"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                className="btn btn-small reportadu-action-btn"
                                                                onClick={() => handleRenameClick(item)}
                                                            >
                                                                Edit Details
                                                            </button>
                                                            <button 
                                                                className="btn btn-small reportadu-action-btn"
                                                                onClick={() => handleDeleteItem(item.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ReportsAddDeleteUpdate;