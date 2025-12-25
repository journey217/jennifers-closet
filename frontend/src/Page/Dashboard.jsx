import { useEffect, useState } from 'react';
import { FaSave, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Component/Navbar.jsx';
import Footer from '../Component/Footer.jsx';
import '../Styles/Dashboard.css';

const Dashboard = () => {
    const [activeData, setActiveData] = useState({
        about: '',
        donate: '',
        volunteer: '',
        hours: ''
    });
    
    const [previews, setPreviews] = useState({
        about: false,
        donate: false,
        volunteer: false,
        hours: false
    });
    
    const [wishlist, setWishlist] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/data`);
            const data = await response.json();

            if (data.success) {
                setActiveData({
                    about: data.aboutData || '',
                    donate: data.donateData || '',
                    volunteer: data.volunteerData || '',
                    hours: data.hoursData || ''
                });
                setWishlist(data.wishlist || []);
            } else {
                showMessage('Error fetching data', 'error');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleActiveChange = (field, value) => {
        setActiveData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePreview = (field) => {
        setPreviews(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const saveActiveData = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/active`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activeData)
            });

            const data = await response.json();
            if (data.success) {
                showMessage('Active data saved successfully!', 'success');
            } else {
                showMessage('Error saving active data', 'error');
            }
        } catch (error) {
            console.error('Error saving active data:', error);
            showMessage('Error saving active data', 'error');
        } finally {
            setSaving(false);
        }
    };

    const addWishlistItem = async () => {
        if (!newItem.trim()) {
            showMessage('Please enter an item', 'error');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item: newItem })
            });

            const data = await response.json();
            if (data.success) {
                setWishlist([...wishlist, { id: data.id, item: newItem }]);
                setNewItem('');
                showMessage('Item added successfully!', 'success');
            } else {
                showMessage('Error adding item', 'error');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            showMessage('Error adding item', 'error');
        }
    };

    const deleteWishlistItem = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/wishlist/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setWishlist(wishlist.filter(item => item.id !== id));
                showMessage('Item deleted successfully!', 'success');
            } else {
                showMessage('Error deleting item', 'error');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            showMessage('Error deleting item', 'error');
        }
    };

    const moveItem = async (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex < 0 || newIndex >= wishlist.length) return;

        const newWishlist = [...wishlist];
        const temp = newWishlist[index];
        newWishlist[index] = newWishlist[newIndex];
        newWishlist[newIndex] = temp;

        setWishlist(newWishlist);

        // Save the new order to the backend
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/wishlist/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: newWishlist })
            });

            const data = await response.json();
            if (!data.success) {
                showMessage('Error reordering items', 'error');
                // Revert on error
                fetchData();
            }
        } catch (error) {
            console.error('Error reordering items:', error);
            showMessage('Error reordering items', 'error');
            // Revert on error
            fetchData();
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="dashboard-content">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Navbar />
            
            <div className="dashboard-content">
                <h1 className="dashboard-title">Dashboard</h1>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Active Data Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Active Information</h2>
                        <button 
                            className="save-btn"
                            onClick={saveActiveData}
                            disabled={saving}
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="form-group">
                        <div className="field-header">
                            <label htmlFor="about">About</label>
                            <button 
                                className="preview-btn"
                                onClick={() => togglePreview('about')}
                                type="button"
                            >
                                {previews.about ? <><FaEyeSlash /> Hide Preview</> : <><FaEye /> Show Preview</>}
                            </button>
                        </div>
                        {!previews.about ? (
                            <textarea
                                id="about"
                                value={activeData.about}
                                onChange={(e) => handleActiveChange('about', e.target.value)}
                                rows="6"
                                placeholder="Enter information about the closet..."
                            />
                        ) : (
                            <div 
                                className="html-preview"
                                dangerouslySetInnerHTML={{ __html: activeData.about }}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <div className="field-header">
                            <label htmlFor="donate">Donate</label>
                            <button 
                                className="preview-btn"
                                onClick={() => togglePreview('donate')}
                                type="button"
                            >
                                {previews.donate ? <><FaEyeSlash /> Hide Preview</> : <><FaEye /> Show Preview</>}
                            </button>
                        </div>
                        {!previews.donate ? (
                            <textarea
                                id="donate"
                                value={activeData.donate}
                                onChange={(e) => handleActiveChange('donate', e.target.value)}
                                rows="6"
                                placeholder="Enter donation information..."
                            />
                        ) : (
                            <div 
                                className="html-preview"
                                dangerouslySetInnerHTML={{ __html: activeData.donate }}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <div className="field-header">
                            <label htmlFor="volunteer">Volunteer</label>
                            <button 
                                className="preview-btn"
                                onClick={() => togglePreview('volunteer')}
                                type="button"
                            >
                                {previews.volunteer ? <><FaEyeSlash /> Hide Preview</> : <><FaEye /> Show Preview</>}
                            </button>
                        </div>
                        {!previews.volunteer ? (
                            <textarea
                                id="volunteer"
                                value={activeData.volunteer}
                                onChange={(e) => handleActiveChange('volunteer', e.target.value)}
                                rows="6"
                                placeholder="Enter volunteer information..."
                            />
                        ) : (
                            <div 
                                className="html-preview"
                                dangerouslySetInnerHTML={{ __html: activeData.volunteer }}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <div className="field-header">
                            <label htmlFor="hours">Hours</label>
                            <button 
                                className="preview-btn"
                                onClick={() => togglePreview('hours')}
                                type="button"
                            >
                                {previews.hours ? <><FaEyeSlash /> Hide Preview</> : <><FaEye /> Show Preview</>}
                            </button>
                        </div>
                        {!previews.hours ? (
                            <textarea
                                id="hours"
                                value={activeData.hours}
                                onChange={(e) => handleActiveChange('hours', e.target.value)}
                                rows="4"
                                placeholder="Enter hours information..."
                            />
                        ) : (
                            <div 
                                className="html-preview"
                                dangerouslySetInnerHTML={{ __html: activeData.hours }}
                            />
                        )}
                    </div>
                </section>

                {/* Wishlist Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Wishlist Items</h2>
                    </div>

                    <div className="add-item-form">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addWishlistItem()}
                            placeholder="Enter new wishlist item..."
                        />
                        <button className="add-btn" onClick={addWishlistItem}>
                            <FaPlus /> Add Item
                        </button>
                    </div>

                    <div className="wishlist-items">
                        {wishlist.length === 0 ? (
                            <p className="no-items">No wishlist items yet. Add one above!</p>
                        ) : (
                            wishlist.map((item, index) => (
                                <div key={item.id} className="wishlist-item">
                                    <span className="item-text">{item.item}</span>
                                    <div className="item-actions">
                                        <button
                                            className="action-btn"
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            title="Move up"
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            className="action-btn"
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === wishlist.length - 1}
                                            title="Move down"
                                        >
                                            <FaArrowDown />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => deleteWishlistItem(item.id)}
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <Footer hoursData={activeData.hours} />
        </div>
    );
};

export default Dashboard;
