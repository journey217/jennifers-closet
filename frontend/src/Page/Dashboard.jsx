import { useEffect, useState } from 'react';
import { FaSave, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Component/Navbar.jsx';
import Footer from '../Component/Footer.jsx';
import '../Styles/Dashboard.css';

const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [userId, setUserId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [pageToken, setPageToken] = useState(null);
    
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
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
    
    const [sectionToggle, setSectionToggle] = useState({
        about: 1,
        events: 1,
        donate: 1,
        volunteer: 1
    });
    const [savingToggle, setSavingToggle] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (isAuthenticated && userId && authToken) {
            fetchData();
            generatePageToken();
        }
    }, [isAuthenticated, userId, authToken]);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const setCookie = (name, value, days) => {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value}${expires}; path=/`;
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const checkAuthentication = async () => {
        const id = getCookie('id');
        const token = getCookie('token');

        if (!id || !token) {
            setIsCheckingAuth(false);
            setIsAuthenticated(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/verify-auth-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: id,
                    auth_token: token
                })
            });

            const data = await response.json();

            if (data.success && data.valid) {
                setUserId(parseInt(id));
                setAuthToken(token);
                setIsAuthenticated(true);
            } else {
                deleteCookie('id');
                deleteCookie('token');
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Error verifying authentication:', error);
            deleteCookie('id');
            deleteCookie('token');
            setIsAuthenticated(false);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginForm.username,
                    password: loginForm.password
                })
            });

            const data = await response.json();

            if (data.success) {
                setCookie('id', data.user_id, 30);
                setCookie('token', data.auth_token, 30);
                setUserId(data.user_id);
                setAuthToken(data.auth_token);
                setIsAuthenticated(true);
                setLoginForm({ username: '', password: '' });
            } else {
                setLoginError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('Login failed. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        deleteCookie('id');
        deleteCookie('token');
        setUserId(null);
        setAuthToken(null);
        setPageToken(null);
        setIsAuthenticated(false);
        setActiveData({ about: '', donate: '', volunteer: '', hours: '' });
        setWishlist([]);
    };

    const generatePageToken = async () => {
        if (!userId || !authToken) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/generate-page-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId })
            });

            const data = await response.json();

            if (data.success) {
                setPageToken(data.page_token);
            } else {
                console.error('Failed to generate page token');
                showMessage('Failed to generate page token', 'error');
            }
        } catch (error) {
            console.error('Error generating page token:', error);
            showMessage('Error generating page token', 'error');
        }
    };

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
                setSectionToggle(data.sectionToggle || {
                    about: 1,
                    events: 1,
                    donate: 1,
                    volunteer: 1
                });
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

    const handleSectionToggleChange = (field) => {
        setSectionToggle(prev => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1
        }));
    };

    const saveSectionToggle = async () => {
        setSavingToggle(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/section-toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    page_token: pageToken,
                    ...sectionToggle
                })
            });

            const data = await response.json();
            if (data.success) {
                showMessage('Section visibility settings saved successfully!', 'success');
            } else {
                if (data.message && data.message.includes('page token')) {
                    await generatePageToken();
                    showMessage('Session refreshed. Please try saving again.', 'warning');
                } else {
                    showMessage('Error saving section toggle settings', 'error');
                }
            }
        } catch (error) {
            console.error('Error saving section toggle:', error);
            showMessage('Error saving section toggle settings', 'error');
        } finally {
            setSavingToggle(false);
        }
    };

    const saveActiveData = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_PATH}/api/active`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    page_token: pageToken,
                    ...activeData
                })
            });

            const data = await response.json();
            if (data.success) {
                showMessage('Active data saved successfully!', 'success');
            } else {
                if (data.message && data.message.includes('page token')) {
                    await generatePageToken();
                    showMessage('Session refreshed. Please try saving again.', 'warning');
                } else {
                    showMessage('Error saving active data', 'error');
                }
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

    if (isCheckingAuth) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="dashboard-content">
                    <p>Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="dashboard-content">
                    <div className="login-container">
                        <h1 className="dashboard-title">Dashboard Login</h1>
                        <form className="login-form" onSubmit={handleLogin}>
                            {loginError && (
                                <div className="message error">
                                    {loginError}
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                    required
                                    disabled={isLoggingIn}
                                    autoComplete="username"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    required
                                    disabled={isLoggingIn}
                                    autoComplete="current-password"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="login-btn"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
                <Footer hoursData="" />
            </div>
        );
    }

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
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Section Visibility Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2>Section Visibility</h2>
                        <button 
                            className="save-btn"
                            onClick={saveSectionToggle}
                            disabled={savingToggle}
                        >
                            <FaSave /> {savingToggle ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="toggle-section">
                        <p className="section-description">
                            Control which sections are visible on the main website. Disabled sections will be hidden from both the page and navigation menu.
                        </p>
                        
                        <div className="toggle-grid">
                            <div className="toggle-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={sectionToggle.about === 1}
                                        onChange={() => handleSectionToggleChange('about')}
                                        className="toggle-checkbox"
                                    />
                                    <span className="toggle-text">About Section</span>
                                </label>
                                <span className={`toggle-status ${sectionToggle.about === 1 ? 'enabled' : 'disabled'}`}>
                                    {sectionToggle.about === 1 ? 'Visible' : 'Hidden'}
                                </span>
                            </div>

                            <div className="toggle-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={sectionToggle.events === 1}
                                        onChange={() => handleSectionToggleChange('events')}
                                        className="toggle-checkbox"
                                    />
                                    <span className="toggle-text">Events/Calendar Section</span>
                                </label>
                                <span className={`toggle-status ${sectionToggle.events === 1 ? 'enabled' : 'disabled'}`}>
                                    {sectionToggle.events === 1 ? 'Visible' : 'Hidden'}
                                </span>
                            </div>

                            <div className="toggle-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={sectionToggle.donate === 1}
                                        onChange={() => handleSectionToggleChange('donate')}
                                        className="toggle-checkbox"
                                    />
                                    <span className="toggle-text">Donate Section</span>
                                </label>
                                <span className={`toggle-status ${sectionToggle.donate === 1 ? 'enabled' : 'disabled'}`}>
                                    {sectionToggle.donate === 1 ? 'Visible' : 'Hidden'}
                                </span>
                            </div>

                            <div className="toggle-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={sectionToggle.volunteer === 1}
                                        onChange={() => handleSectionToggleChange('volunteer')}
                                        className="toggle-checkbox"
                                    />
                                    <span className="toggle-text">Volunteer Section</span>
                                </label>
                                <span className={`toggle-status ${sectionToggle.volunteer === 1 ? 'enabled' : 'disabled'}`}>
                                    {sectionToggle.volunteer === 1 ? 'Visible' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

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
