import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader, CheckCircle, AlertCircle, ShoppingBag, Grid, DollarSign, Package, User, Clock, Box,
    MapPin, Phone, Mail, Building, FileText, List, Info, Zap, Ruler, Check, Ban, Image as ImageIcon,
    Clipboard, Plus, Minus, Hash, Eye, CornerDownRight, TrendingUp, Calendar
} from 'lucide-react';

// --- API URL Definition FIX (Retained) ---
const getBaseApiUrl = () => {
    // Note: In a real environment, replace 'http://localhost:5000/api/' with your actual base API URL.
    const url = 'https://api.hivictus.com/api/'; 
    return url.replace(/\/?$/, '/');
};

const API_URL = getBaseApiUrl();

// Helper to determine status style
const getStatusTag = (status) => {
    let style = "text-white text-xs font-semibold px-3 py-1 rounded-full capitalize flex items-center shadow-sm";
    let colorClass;
    let icon = <Info size={12} className="mr-1" />;

    switch (status?.toLowerCase()) {
        case 'approved':
            colorClass = 'bg-green-600';
            icon = <Check size={12} className="mr-1" />;
            break;
        case 'pending':
            colorClass = 'bg-yellow-500';
            icon = <Clock size={12} className="mr-1" />;
            break;
        case 'rejected':
            colorClass = 'bg-red-500';
            icon = <Ban size={12} className="mr-1" />;
            break;
        case 'new':
        default:
            colorClass = 'bg-blue-600'; // Darker blue for a professional, "new task" feel
            icon = <Zap size={12} className="mr-1" />;
            break;
    }
    return <span className={`${style} ${colorClass}`}>{icon} {status || 'New'}</span>;
};

// Placeholder image for products missing URLs
const defaultImage = 'https://placehold.co/400x200/E0E0E0/333333?text=Product+Image';


// --- Helper Components for Modal (Improved Styling) ---

// Detail item for properties in a ServiceNow-like "form" layout
const FormDetailItem = ({ icon: Icon, label, value, labelClass = "text-gray-500", valueClass = "font-medium text-gray-800" }) => (
    <div className="flex flex-col">
        <span className={`text-xs uppercase tracking-wider ${labelClass} flex items-center mb-1`}>
            <Icon size={12} className="mr-1 text-indigo-400" /> {label}
        </span>
        <p className={`text-sm ${valueClass} break-words`}>{value || 'N/A'}</p>
    </div>
);

// Full Seller Details block for the modal (ServiceNow-like panel)
const SellerDetails = ({ seller, loading, getStatusTag, productId }) => {
    const displayProductId = (typeof productId === 'object' && productId !== null) ? productId._id : productId;
    
    if (loading) {
        return <div className="flex justify-center items-center h-32"><Loader className="animate-spin text-indigo-500" size={24} /></div>;
    }

    if (!seller) {
        return <p className="text-sm text-red-700 p-3 bg-red-50 rounded-lg border border-red-200"><AlertCircle size={16} className="inline mr-2" />Seller details unavailable for ID: {displayProductId || 'N/A'}.</p>;
    }
    
    // Format address
    const addressLine = `${seller.address?.street || ''}, ${seller.address?.city || ''}, ${seller.address?.state || ''} - ${seller.address?.pincode || ''}`.replace(/,\s*-\s*$/, '').trim();
    
    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-base font-bold text-gray-700 flex items-center border-b pb-2 mb-2">
                <Building size={16} className="mr-2 text-indigo-600" /> Seller Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
                <FormDetailItem icon={User} label="Contact Person" value={seller.sellerName} />
                <FormDetailItem icon={Building} label="Company Name" value={seller.companyName} />
                <FormDetailItem icon={Mail} label="Email" value={seller.email} />
                <FormDetailItem icon={Phone} label="Mobile" value={seller.mobile} />
                <FormDetailItem icon={MapPin} label="Address" value={addressLine} />
                <FormDetailItem icon={List} label="Business Type" value={seller.businessType} />
            </div>
            
            <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-500 flex items-center">
                        <TrendingUp size={12} className="mr-1 text-indigo-400" /> Account Status
                    </span>
                    {getStatusTag(seller.sellerStatus)}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

const AdminProductReview = ({ handleLogout }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sellerDetails, setSellerDetails] = useState(null); 
    const [sellerLoading, setSellerLoading] = useState(false); 

    const [statusLoadingId, setStatusLoadingId] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3000);
    }, []);
    
    const handleAuthError = useCallback((message) => {
        showToast(message, 'error');
        if (typeof handleLogout === 'function') handleLogout(); 
    }, [showToast, handleLogout]);

    // --- Fetch Seller Details by ID ---
    const fetchSellerDetails = useCallback(async (sellerId) => {
        if (!sellerId) return null;
        setSellerLoading(true);
        const authToken = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_URL}sellerprofile/${sellerId}`, {
                headers: { 'x-auth-token': authToken },
            });
            // ... (rest of the fetchSellerDetails logic)
            if (response.status === 404) return null;
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) throw new Error('Unauthorized or Forbidden. Session expired.');
                throw new Error(`Failed to fetch seller details (Status: ${response.status}).`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Seller fetch error:', err.message);
            if (err.message.includes('Unauthorized')) handleAuthError('Session expired while fetching seller details.');
            return null;
        } finally {
            setSellerLoading(false);
        }
    }, [handleAuthError]);


    // --- Fetch All Products for Admin ---
    const fetchAllProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        const authToken = localStorage.getItem('authToken'); 

        if (!authToken) {
            handleAuthError('Authentication token missing. Logging out.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}products/admin/all`, {
                headers: { 'x-auth-token': authToken },
            });
            
            if (response.status === 401 || response.status === 403) {
                handleAuthError('Access denied. You may not have administrative privileges.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch product data.');
            }

            const data = await response.json();
            setProducts(data);

        } catch (err) {
            console.error('Fetch products error:', err.message);
            setError(`Could not load products: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [handleAuthError]);

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    // --- Product Status Update ---
    const updateProductStatus = useCallback(async (productId, status) => {
        if (!selectedProduct) return;
        setStatusLoadingId(productId);
        const authToken = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_URL}products/admin/status/${productId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': authToken 
                },
                body: JSON.stringify({ status })
            });

            if (response.status === 401 || response.status === 403) {
                handleAuthError('Authorization failed during status update.');
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update status to ${status}.`);
            }
            
            setIsDetailModalOpen(false);
            showToast(`Product **${selectedProduct.name}** status updated to **${status.toUpperCase()}**.`, 'success');
            fetchAllProducts();

        } catch (err) {
            console.error('Update status error:', err.message);
            showToast(err.message, 'error');
        } finally {
            setStatusLoadingId(null);
        }
    }, [handleAuthError, fetchAllProducts, selectedProduct, showToast]);


    // --- Modal Logic ---
    const openDetailModal = useCallback(async (product) => {
        setSelectedProduct(product);
        setSellerDetails(null); 
        setIsDetailModalOpen(true);
        
        const actualSellerId = product.sellerId?._id || product.sellerId;
        
        const sellerData = await fetchSellerDetails(actualSellerId);
        setSellerDetails(sellerData);
    }, [fetchSellerDetails]);

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedProduct(null);
        setSellerDetails(null);
    };

    // --- Product Detail Modal Component (ServiceNow-Style Popup) ---
    const ProductReviewModal = () => {
        if (!selectedProduct) return null;
        
        const [currentImageIndex, setCurrentImageIndex] = useState(0);

        const {
            _id, name, description, price, unit, quantity, imageUrls, category, subCategory, type, sellerId, status, createdAt
        } = selectedProduct;

        const images = Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []);
        const hasMultipleImages = images.length > 1;
        const currentImageSource = images[currentImageIndex] || defaultImage;

        const nextImage = () => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        };

        const prevImage = () => {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
        };

        const isUpdating = statusLoadingId === _id;
        const categoryName = typeof category === 'object' && category !== null ? category.name : category;
        const formattedPrice = `₹${price?.toFixed(2) || '0.00'} / ${unit || 'N/A'}`;
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
                onClick={closeDetailModal}
            >
                <motion.div
                    initial={{ scale: 0.95, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: -20 }}
                    className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all flex flex-col border-t-4 border-indigo-600"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header/Title Bar */}
                    <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                            <Clipboard size={22} className="mr-2 text-indigo-600" /> Product Review: **{name}**
                        </h2>
                        <button 
                            onClick={closeDetailModal} 
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* LEFT COLUMN: Product & Seller Details (2/3 width) */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Product Main Form Details */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-gray-700 flex items-center border-b pb-2 mb-2">
                                        <ShoppingBag size={18} className="mr-2 text-indigo-600" /> General Details
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormDetailItem icon={Hash} label="Product ID" value={_id} />
                                        <FormDetailItem icon={Calendar} label="Created Date" value={formattedDate} />
                                        <FormDetailItem icon={DollarSign} label="Price/Unit" value={formattedPrice} valueClass="font-bold text-lg text-green-700" />
                                        <div className='col-span-2 md:col-span-1'>
                                            <FormDetailItem icon={Package} label="Quantity" value={`${quantity || 'N/A'} ${unit || ''}`} />
                                        </div>
                                        
                                        <FormDetailItem icon={Grid} label="Category" value={categoryName || 'N/A'} />
                                        <FormDetailItem icon={List} label="Sub-Category" value={subCategory || 'N/A'} />
                                        <FormDetailItem icon={Box} label="Type" value={type || 'N/A'} />
                                    </div>

                                    {/* Description Block */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <FormDetailItem 
                                            icon={FileText} 
                                            label="Description" 
                                            value={description || 'No description provided.'} 
                                            valueClass="text-gray-600 italic leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* Seller Details Panel */}
                                <SellerDetails 
                                    seller={sellerDetails} 
                                    loading={sellerLoading} 
                                    getStatusTag={getStatusTag} 
                                    productId={sellerId}
                                />
                            </div>

                            {/* RIGHT COLUMN: Image Gallery & Actions (1/3 width) */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* Product Image Gallery */}
                                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center">
                                        <ImageIcon size={16} className="mr-2 text-indigo-600" /> Product Images ({images.length} available)
                                    </h4>
                                    
                                    {/* Main Image Viewport */}
                                    <div className="relative w-full h-48 rounded-lg shadow-inner border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.img 
                                                key={currentImageSource}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                src={currentImageSource} 
                                                alt={`${name} image ${currentImageIndex + 1}`} 
                                                className="w-full h-full object-contain"
                                                onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                            />
                                        </AnimatePresence>
                                        
                                        {/* Navigation Buttons */}
                                        {hasMultipleImages && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition disabled:opacity-30"
                                                >
                                                    <Minus size={16} className="rotate-90" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition disabled:opacity-30"
                                                >
                                                    <Plus size={16} className="rotate-90" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Thumbnails */}
                                    {hasMultipleImages && (
                                        <div className="flex space-x-2 mt-3 overflow-x-auto pb-1">
                                            {images.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img || defaultImage}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className={`w-12 h-12 object-cover rounded-md cursor-pointer border-2 transition ${
                                                        index === currentImageIndex ? 'border-indigo-600 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                                                    }`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Status & Action Block (Prominent) */}
                                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 shadow-md space-y-4">
                                    <h3 className="text-lg font-bold text-indigo-700 flex items-center">
                                        <Zap size={18} className="mr-2" /> Review Action
                                    </h3>
                                    <div className="flex items-center justify-between p-2 bg-white rounded-md border border-indigo-300">
                                        <span className="font-semibold text-sm text-gray-700">Current Status:</span>
                                        {getStatusTag(status)}
                                    </div>
                                    
                                    <div className="flex flex-col space-y-3 pt-2">
                                        
                                        <button
                                            onClick={() => updateProductStatus(_id, 'approved')}
                                            disabled={isUpdating}
                                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                        >
                                            {isUpdating && statusLoadingId === _id ? <Loader size={20} className="animate-spin mr-2" /> : <Check size={20} className="mr-2" />}
                                            {isUpdating && statusLoadingId === _id ? 'Approving...' : 'Approve Product'}
                                        </button>

                                        <button
                                            onClick={() => updateProductStatus(_id, 'rejected')}
                                            disabled={isUpdating}
                                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                        >
                                            {isUpdating && statusLoadingId === _id ? <Loader size={20} className="animate-spin mr-2" /> : <Ban size={20} className="mr-2" />}
                                            {isUpdating && statusLoadingId === _id ? 'Rejecting...' : 'Reject Product'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-indigo-700 text-center pt-2 border-t border-indigo-100">
                                        Action required to update the product's marketplace visibility.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    // --- Product Table Row Component (For cleaner main list) ---
    const ProductTableRow = ({ product, index }) => {
        const { _id, name, price, unit, category, sellerName, status, createdAt } = product;

        // Ensure category name is a string
        const categoryName = typeof category === 'object' && category !== null ? category.name : category;
        const formattedPrice = `₹${price?.toFixed(2) || 'N/A'}`;
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
        const isOddRow = index % 2 !== 0;

        return (
            <tr 
                className={`transition-colors duration-200 cursor-pointer ${isOddRow ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}`}
                onClick={() => openDetailModal(product)}
            >
                <td className="px-6 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                    <span className="text-indigo-600 font-mono text-xs hidden sm:inline mr-2">#{_id.slice(-4)}</span>
                    <span className="font-semibold">{name}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200 hidden md:table-cell">
                    {categoryName || 'N/A'}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-green-700 border-b border-gray-200">
                    {formattedPrice} <span className='text-gray-500 font-normal ml-1'>/{unit}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800 border-b border-gray-200 hidden lg:table-cell">
                    {sellerName || 'Unknown'}
                </td>
                <td className="px-6 py-3 whitespace-nowrap border-b border-gray-200">
                    {getStatusTag(status)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium border-b border-gray-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); openDetailModal(product); }}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                        aria-label={`Review ${name}`}
                    >
                        <Eye size={16} className="mr-1" /> View/Review
                    </button>
                </td>
            </tr>
        );
    };


    // --- Main Render ---

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            
            {/* Header/Banner */}
            <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-indigo-100">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center">
                  
                </h1>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchAllProducts}
                        className="flex items-center text-sm px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-300 shadow-sm hover:bg-indigo-50 transition duration-150"
                        disabled={loading}
                    >
                        {loading ? <Loader size={16} className="animate-spin mr-2" /> : <List size={16} className="mr-2" />}
                        Refresh
                    </button>
                    {/* Logout Button for completeness */}
                    {handleLogout && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-sm px-4 py-2 bg-red-500 text-white font-medium rounded-lg shadow-sm hover:bg-red-600 transition duration-150"
                        >
                            <CornerDownRight size={16} className="mr-2" /> Logout
                        </button>
                    )}
                </div>
            </header>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 text-white flex items-center transition-all min-w-[250px] ${
                            toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                    >
                        {toastType === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                        <span className="font-semibold">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            {loading && (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg border border-gray-200">
                    <Loader size={40} className="animate-spin text-indigo-600" />
                    <p className="ml-4 text-xl text-gray-600">Loading product tasks...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center shadow-md">
                    <AlertCircle size={20} className="mr-3" />
                    <span className="font-medium">Connection Error:</span> {error}
                </div>
            )}

            {!loading && products.length === 0 && !error && (
                <div className="p-10 text-center bg-white rounded-xl shadow-lg border border-gray-200">
                    <Info size={36} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 font-medium">🎉 All products reviewed! No tasks currently awaiting action.</p>
                </div>
            )}

            {/* Data Table View (ServiceNow-like List) */}
            {!loading && products.length > 0 && (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Product Name / ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Seller
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product, index) => (
                                    <ProductTableRow key={product._id} product={product} index={index} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && <ProductReviewModal />}
            </AnimatePresence>
        </div>
    );
};

export default AdminProductReview;