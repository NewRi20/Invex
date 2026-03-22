import { Search, X, Upload } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../AuthProvider';
import { API_BASE_URL } from '../../../config'; 
import DataImportOverlay from '../../../components/DataImportOverlay/DataImportOverlay';

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
    const [showImportModal, setShowImportModal] = useState(false);

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
            const itemsRes = await fetch(`${API_BASE_URL}/items/`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const itemsData = await itemsRes.json();
            
            // Fetch Categories for the dropdowns
            const catRes = await fetch(`${API_BASE_URL}/items/categories`, {
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
            const response = await fetch(`${API_BASE_URL}/items/add`, {
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
            setNewItemForm({ name: '', category_id: '', quantity: '', price: '' });
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
            const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
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
            const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
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
            const response = await fetch(`${API_BASE_URL}/items/categories`, {
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
            const response = await fetch(`${API_BASE_URL}/items/categories/${categoryId}`, {
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
            <DataImportOverlay 
                isOpen={showImportModal} 
                onClose={() => setShowImportModal(false)}
                onUploadSuccess={() => {
                    fetchItems(); 
                }}
            />
            {/* Add Item Section */}
            <form className="bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] p-5 mb-5" onSubmit={handleSaveNewItem}>
                <h3 className="bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] font-bold p-5 rounded-[20px] mb-5 text-lg whitespace-nowrap">Add Item</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2.5">
                    <input
                        type="text"
                        name="name"
                        value={newItemForm.name}
                        onChange={handleNewItemChange}
                        placeholder="Name"
                        className="input mb-0 border border-[var(--primary-bg)] placeholder:text-[var(--primary-bg-light)] placeholder:opacity-50 w-full"
                        required
                    />
                    <select
                        name="category_id"
                        value={newItemForm.category_id}
                        onChange={handleNewItemChange}
                        className="input mb-0 border border-[var(--primary-bg)] w-full"
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
                        className="input mb-0 border border-[var(--primary-bg)] placeholder:text-[var(--primary-bg-light)] placeholder:opacity-50 w-full"
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
                        className="input mb-0 border border-[var(--primary-bg)] placeholder:text-[var(--primary-bg-light)] placeholder:opacity-50 w-full"
                        min="0"
                        required
                    />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <button type="submit" className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] hover:bg-[var(--Btn-bg-blue-light)] w-full sm:w-auto">
                        Save
                    </button>
                    <button type="button" onClick={() => setNewItemForm({ name: '', category_id: '', quantity: '', price: '' })} className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] hover:bg-[var(--Btn-bg-blue-light)] w-full sm:w-auto">
                        Clear
                    </button>
                    <button type="button" className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] hover:bg-[var(--Btn-bg-blue-light)] w-full sm:w-auto" onClick={() => setShowImportModal(true)}>
                        Import
                    </button>
                </div>
            </form>

            {/* --- Category Management List --- */}
            <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] p-5 mb-5">
                <div className='flex justify-between items-center mb-5'>
                    <h3 className="bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] font-bold p-5 rounded-[20px] text-lg whitespace-nowrap">Manage Categories</h3>
                    <div className="">
                        <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary bg-[var(--primary-bg)] text-[var(--white-blue-text)] hover:bg-[var(--primary-bg-light)]">
                            Add New Category
                        </button>
                    </div>
                </div>
                
                
                <div className="bg-white rounded-[var(--border-radius)] p-0 overflow-hidden">
                    <table className="table w-full">
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
                                                className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] text-[10px] px-1.5 py-1 hover:bg-[var(--Btn-bg-blue-light)] rounded ml-auto"
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
                                <button type="submit" className="btn btn-small btn-secondary w-full" style={{width: '100%'}}>
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item List Section */}
            <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] rounded-[20px] p-5 mb-5">
                <div className="flex flex-col md:flex-row items-center bg-[var(--primary-bg-light)] text-[var(--white-blue-text)] font-bold p-5 rounded-[20px] mb-5 text-lg">
                    <h3 className="mr-auto whitespace-nowrap mb-3 md:mb-0">Item List</h3>

                    {/* Search Bar */}
                    <div className="flex items-center border border-[var(--white-blue-text)] outline-none rounded-[10px] w-full md:w-auto ml-0 md:ml-5">
                        <input
                            type="text"
                            placeholder="Search"
                            className="p-1.5 border-none outline-none bg-transparent m-1.5 text-[var(--white-blue-text)] flex-1 min-w-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={20} className="h-5 w-5 m-1.5 text-[var(--white-blue-text)] flex-shrink-0" />
                    </div>
                </div>

                {/* Item Table */}
                <div className="bg-white rounded-[var(--border-radius)] p-0 overflow-hidden overflow-x-auto">
                    <table className="table w-full">
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
                                                        className="input py-1 px-2 text-sm w-full"
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
                                                        className="input py-1 px-2 text-sm w-full"
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    item.categoryName
                                                )}
                                            </td>
                                            
                                            <td> {item.quantity} </td>
                                            
                                            <td>
                                                 {isEditing ? (
                                                     <input 
                                                        type="number"
                                                        name="price"
                                                        value={editFormData.price}
                                                        onChange={handleEditChange}
                                                        className="input py-1 px-2 text-sm w-20"
                                                        step="0.01"
                                                     />
                                                 ) : (
                                                     `₱${(item.price || 0).toFixed(2)}`
                                                 )}
                                            </td>

                                            <td>{item.last_modified ? new Date(item.last_modified).toLocaleDateString() : '-'}</td>
                                            
                                            <td>
                                                <div className="flex gap-1 flex-wrap">
                                                    {isEditing ? (
                                                        <>
                                                            <button className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] text-[10px] px-1.5 py-1 hover:bg-[var(--Btn-bg-blue-light)] rounded" onClick={() => handleSaveChanges(item.id)}>Save</button>
                                                            <button className="btn btn-small bg-[var(--secondary-bg)] text-[var(--primary-bg)] text-[10px] px-1.5 py-1 hover:bg-[var(--secondary-bg-light)] rounded" onClick={handleCancelEdit}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] text-[10px] px-1.5 py-1 hover:bg-[var(--Btn-bg-blue-light)] rounded" onClick={() => handleRenameClick(item)}>Edit</button>
                                                            <button className="btn btn-small bg-[var(--Btn-bg-blue)] text-[var(--white-blue-text)] text-[10px] px-1.5 py-1 hover:bg-[var(--Btn-bg-blue-light)] rounded" onClick={() => handleDeleteItem(item.id)}>Del</button>
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
