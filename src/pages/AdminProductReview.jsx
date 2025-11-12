import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx'; // Import Excel library
import * as FileSaver from 'file-saver'; // Import FileSaver

import {
    X, Loader, CheckCircle, AlertCircle, ShoppingBag, Grid, DollarSign, Package, User, Clock, Box,
    MapPin, Phone, Mail, Building, FileText, List, Info, Zap, Ruler, Check, Ban, Image as ImageIcon,
    Clipboard, Plus, Minus, Hash, Eye, CornerDownRight, TrendingUp, Calendar, Truck, Search, ChevronLeft, ChevronRight, TrendingDown, Download
} from 'lucide-react';

// --- API URL Definition FIX (Retained) ---
const getBaseApiUrl = () => {
    // Note: In a real environment, replace 'http://localhost:5000/api/' with your actual base API URL. https://api.hivictus.com/api/
    const url = 'https://api.hivictus.com/api/';
    return url.replace(/\/?$/, '/');
};

const API_URL = getBaseApiUrl();

// Placeholder image for products missing URLs
const defaultImage = 'https://placehold.co/40x40/E0E0E0/333333?text=Img';

// Helper to determine status style
const getStatusTag = (status) => {
    let style = "text-white text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex items-center shadow-sm";
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


// --- Helper Components for Modal ---

const FormDetailItem = ({ icon: Icon, label, value, labelClass = "text-gray-500", valueClass = "font-medium text-gray-800" }) => (
    <div className="flex flex-col">
        <span className={`text-xs uppercase tracking-wider ${labelClass} flex items-center mb-1`}>
            <Icon size={12} className="mr-1 text-indigo-400" /> {label}
        </span>
        <p className={`text-sm ${valueClass} break-words`}>{value || 'N/A'}</p>
    </div>
);

const SellerDetails = ({ seller, loading, getStatusTag, productId }) => {
    const displayProductId = (typeof productId === 'object' && productId !== null) ? productId._id : productId;

    if (loading) {
        return <div className="flex justify-center items-center h-32"><Loader className="animate-spin text-indigo-500" size={24} /></div>;
    }

    if (!seller) {
        return <p className="text-sm text-red-700 p-3 bg-red-50 rounded-lg border border-red-200"><AlertCircle size={16} className="inline mr-2" />Seller details unavailable for ID: {displayProductId || 'N/A'}.</p>;
    }

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
                    {getStatusTag(seller.registrationStatus)}
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
    const [deliveryChargeInput, setDeliveryChargeInput] = useState('');
    const [deliveryChargeLoading, setDeliveryChargeLoading] = useState(false);

    // --- STATE FOR FILTERING & PAGINATION ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    // ------------------------------------------

    const showToast = useCallback((message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 3000);
    }, []);

    const handleAuthError = useCallback((message) => {
        showToast(message, 'error');
        if (typeof handleLogout === 'function') handleLogout();
    }, [showToast, handleLogout]);

    // --- Data Extraction Helpers ---

    const extractProductData = (product) => {
        const seller = product.sellerId || {};
        const categoryName = product.category?.name || 'N/A';
        const sellerAddress = seller.address || {};
        
        return {
            "Product ID": product._id,
            "Name": product.name,
            "Description": product.description || '—',
            "Status": product.status,
            "Price": product.price,
            "Net Receivable": product.netReceivable,
            "Platform Earnings": product.platformEarnings,
            "Delivery Charges": product.deliveryCharges,
            "Unit": product.unit,
            "Quantity": product.quantity,
            "Dimensions": product.dimensions || '—',
            "Category": categoryName,
            "Sub Category": product.subCategory || '—',
            "Type": product.type || '—',
            "Created Date": new Date(product.createdAt).toLocaleDateString(),
            
            // Seller Details
            "Seller ID": seller._id || '—',
            "Seller Name": seller.sellerName || '—',
            "Company Name": seller.companyName || '—',
            "Seller Email": seller.email || '—',
            "Seller Mobile": seller.mobile || '—',
            "Seller Address (Street)": sellerAddress.street || '—',
            "Seller Address (City/State/Zip)": `${sellerAddress.city || '—'}, ${sellerAddress.state || '—'} ${sellerAddress.pincode || '—'}`,
            "Seller Status": seller.registrationStatus || '—',
        };
    };

    const handleDownloadExcel = (data, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(dataBlob, fileName + '.xlsx');
    };

    // --- Download Handlers ---
    const handleDownloadAllProducts = () => {
        if (products.length === 0) {
            showToast('No products to export.', 'warning');
            return;
        }
        const data = products.map(extractProductData);
        handleDownloadExcel(data, `All_Products_Admin_Review_${new Date().toLocaleDateString()}`);
    };

    const handleDownloadSingleProduct = (product) => {
        if (!product) return;
        const data = [extractProductData(product)];
        handleDownloadExcel(data, `Product_Details_${product.name.replace(/\s/g, '_')}_${product._id.slice(-4)}`);
    };

    // --- Fetch Seller Details by ID (unchanged) ---
    const fetchSellerDetails = useCallback(async (sellerId) => {
        if (!sellerId) return null;
        setSellerLoading(true);
        const authToken = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_URL}sellerprofile/${sellerId}`, {
                headers: { 'x-auth-token': authToken },
            });
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


    // --- Fetch All Products for Admin (unchanged) ---
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
            // Note: The backend route /admin/all should populate sellerId and category
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
            setCurrentPage(1); // Reset to page 1 on new data fetch

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

    // --- Product Status Update (unchanged) ---
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

    // --- API HANDLER: Update Delivery Charges (fixed) ---
    const updateDeliveryCharges = useCallback(async (e, productId, charges) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault(); // FIX: Prevents refresh on form submit
        }

        if (!selectedProduct) return;
        setDeliveryChargeLoading(true);
        const authToken = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_URL}products/admin/deliverycharges/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': authToken
                },
                body: JSON.stringify({ deliveryCharges: parseFloat(charges) })
            });

            if (response.status === 401 || response.status === 403) {
                handleAuthError('Authorization failed during delivery charge update.');
                return;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update delivery charges to ₹${charges}.`);
            }

            const updatedProductData = await response.json();

            // Optimistically update the selectedProduct state
            setSelectedProduct(prev => ({
                ...prev,
                deliveryCharges: updatedProductData.product.deliveryCharges
            }));

            showToast(updatedProductData.message || `Delivery charges updated successfully to ₹${parseFloat(charges).toFixed(2)}.`, 'success');
            fetchAllProducts(); // Re-fetch all products to update the main list

        } catch (err) {
            console.error('Update delivery charges error:', err.message);
            showToast(err.message, 'error');
        } finally {
            setDeliveryChargeLoading(false);
        }
    }, [handleAuthError, fetchAllProducts, selectedProduct, showToast]);


    // --- Modal Logic (unchanged) ---
    const openDetailModal = useCallback(async (product) => {
        setSelectedProduct(product);
        setSellerDetails(null);
        setDeliveryChargeInput(product.deliveryCharges !== undefined ? String(product.deliveryCharges) : '0');
        setIsDetailModalOpen(true);

        const actualSellerId = product.sellerId?._id || product.sellerId;

        const sellerData = await fetchSellerDetails(actualSellerId);
        setSellerDetails(sellerData);
    }, [fetchSellerDetails]);

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedProduct(null);
        setSellerDetails(null);
        setDeliveryChargeInput('');
    };

    // --- MEMOIZED FILTERING LOGIC (unchanged) ---
    const filteredProducts = useMemo(() => {
        let filtered = products;

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(lowerSearchTerm) ||
                (product.sellerName && product.sellerName.toLowerCase().includes(lowerSearchTerm)) ||
                (product.category && product.category.name && product.category.name.toLowerCase().includes(lowerSearchTerm))
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(product => product.status.toLowerCase() === filterStatus);
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(product => {
                const categoryName = typeof product.category === 'object' && product.category !== null ? product.category.name : product.category;
                return categoryName && categoryName === filterCategory;
            });
        }

        return filtered;
    }, [products, searchTerm, filterStatus, filterCategory]);

    // --- MEMOIZED PAGINATION LOGIC (unchanged) ---
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // --- Unique Filter Options (unchanged) ---
    const uniqueCategories = useMemo(() => {
        const categories = new Set();
        products.forEach(p => {
            const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : p.category;
            if (catName) categories.add(catName);
        });
        return Array.from(categories).sort();
    }, [products]);

    const uniqueStatuses = useMemo(() => {
        const statuses = new Set();
        products.forEach(p => {
            if (p.status) statuses.add(p.status.toLowerCase());
        });
        return Array.from(statuses).sort();
    }, [products]);


    // --- Product Detail Modal Component ---
    const ProductReviewModal = () => {
        if (!selectedProduct) return null;

        const [currentImageIndex, setCurrentImageIndex] = useState(0);

        const {
            _id, name, description, price, unit, quantity, imageUrls, category, subCategory, type, sellerId, status, createdAt, deliveryCharges, netReceivable, platformEarnings
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

        const isUpdatingStatus = statusLoadingId === _id;
        const categoryName = typeof category === 'object' && category !== null ? category.name : category;
        const formattedPrice = `₹${price?.toFixed(2) || '0.00'} / ${unit || 'N/A'}`;
        const formattedDeliveryCharges = `₹${deliveryCharges !== undefined ? deliveryCharges.toFixed(2) : '0.00'}`;
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
        const formattedNetReceivable = `₹${netReceivable?.toFixed(2) || '0.00'}`;
        const formattedPlatformEarnings = `₹${platformEarnings?.toFixed(2) || '0.00'}`;


        const handleDeliveryChargeUpdate = (e) => {
            if (deliveryChargeInput === null || isNaN(parseFloat(deliveryChargeInput)) || parseFloat(deliveryChargeInput) < 0) {
                showToast('Please enter a valid non-negative number for delivery charges.', 'error');
                return;
            }
            updateDeliveryCharges(e, _id, deliveryChargeInput);
        };


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
                    onClick={(e) => e.stopPropagation()} // FIX: Prevent modal dismissal on clicks inside
                >
                    {/* Modal Header/Title Bar */}
                    <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                            <Clipboard size={22} className="mr-2 text-indigo-600" /> Product Review: **{name}**
                        </h2>
                        <div className="flex space-x-2 items-center">
                            {/* Download Button for Individual Product */}
                            <motion.button
                                onClick={() => handleDownloadSingleProduct(selectedProduct)}
                                className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                                whileTap={{ scale: 0.9 }}
                                title="Download Product Data"
                            >
                                <Download size={20} />
                            </motion.button>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
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
                                        <FormDetailItem icon={DollarSign} label="Base Price" value={formattedPrice} valueClass="font-bold text-lg text-green-700" />
                                        <FormDetailItem icon={Truck} label="Delivery Charges" value={formattedDeliveryCharges} valueClass="font-bold text-lg text-blue-700" />
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
                                
                                {/* Financial Split Details */}
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 shadow-sm space-y-4">
                                    <h3 className="text-lg font-bold text-purple-700 flex items-center border-b pb-2 mb-2">
                                        <DollarSign size={18} className="mr-2 text-purple-600" /> Financial Split (Before Delivery)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormDetailItem 
                                            icon={TrendingUp} 
                                            label="Platform Earnings (25%)" 
                                            value={formattedPlatformEarnings} 
                                            valueClass="font-bold text-base text-red-600" 
                                        />
                                        <FormDetailItem 
                                            icon={TrendingDown} 
                                            label="Seller Net Receivable (75%)" 
                                            value={formattedNetReceivable} 
                                            valueClass="font-bold text-base text-green-600" 
                                        />
                                    </div>
                                    <p className="text-xs text-purple-700 pt-2 border-t border-purple-100">
                                        These values are calculated automatically based on the base price upon product creation/update.
                                    </p>
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
                                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }} // FIX: Stop propagation
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Charge Update Form (FIXED INPUT ISSUE) */}
                                <div
                                    className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-md space-y-3"
                                    onClick={(e) => e.stopPropagation()} // FIX: Prevent modal dismissal when clicking anywhere in this block
                                >
                                    <h3 className="text-lg font-bold text-yellow-800 flex items-center">
                                        <Truck size={18} className="mr-2" /> Update Delivery Charges
                                    </h3>
                                    {/* FIX: Use an explicit form tag and prevent default submission */}
                                    <form onSubmit={handleDeliveryChargeUpdate} className="flex items-end space-x-2">
                                        <div className="flex-grow">
                                            <label htmlFor="delivery-charge" className="text-xs font-medium text-gray-700 block mb-1">
                                                New Charge (₹)
                                            </label>
                                            <input
                                                id="delivery-charge"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={deliveryChargeInput}
                                                onChange={(e) => setDeliveryChargeInput(e.target.value)}
                                                // FIX: Prevent event propagation when typing to ensure no external event triggers
                                                onKeyDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()} // FIX: Stop clicks from bubbling to modal backdrop
                                                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                disabled={deliveryChargeLoading}
                                            />
                                        </div>
                                        <button
                                            type="submit" // Use type="submit" for forms
                                            disabled={deliveryChargeLoading}
                                            className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deliveryChargeLoading ? <Loader size={20} className="animate-spin" /> : 'Update'}
                                        </button>
                                    </form>
                                    <p className="text-xs text-yellow-700 text-center pt-1 border-t border-yellow-100">
                                        Current: **{formattedDeliveryCharges}**. Set by Admin only.
                                    </p>
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
                                            disabled={isUpdatingStatus}
                                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                        >
                                            {isUpdatingStatus && statusLoadingId === _id ? <Loader size={20} className="animate-spin mr-2" /> : <Check size={20} className="mr-2" />}
                                            {isUpdatingStatus && statusLoadingId === _id ? 'Approving...' : 'Approve Product'}
                                        </button>

                                        <button
                                            onClick={() => updateProductStatus(_id, 'rejected')}
                                            disabled={isUpdatingStatus}
                                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                        >
                                            {isUpdatingStatus && statusLoadingId === _id ? <Loader size={20} className="animate-spin mr-2" /> : <Ban size={20} className="mr-2" />}
                                            {isUpdatingStatus && statusLoadingId === _id ? 'Rejecting...' : 'Reject Product'}
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
    const ProductTableRow = ({ product }) => {
        const { _id, name, price, unit, category, sellerName, status, description, imageUrls } = product;

        const firstImageUrl = (Array.isArray(imageUrls) && imageUrls.length > 0) ? imageUrls[0] : defaultImage;
        const categoryName = typeof category === 'object' && category !== null ? category.name : category;
        const formattedPrice = `₹${price?.toFixed(2) || 'N/A'}`;
        const shortDescription = (description || 'No description').substring(0, 30) + (description && description.length > 30 ? '...' : '');

        return (
            <tr
                className={`transition-colors duration-200 cursor-pointer hover:bg-gray-100`}
                onClick={() => openDetailModal(product)}
            >
                {/* Image Column */}
                <td className="px-3 py-2 border-b border-gray-200 w-16">
                    <img
                        src={firstImageUrl}
                        alt={`${name} thumbnail`}
                        className="w-10 h-10 object-cover rounded-md shadow-sm border border-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                    />
                </td>
                {/* Product Name/Description */}
                <td className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-200 max-w-xs">
                    <div className="flex flex-col">
                        <span className="font-semibold text-indigo-700 truncate">{name}</span>
                        <span className="text-gray-500 text-xs mt-0.5 block truncate" title={description}>
                            {shortDescription}
                        </span>
                    </div>
                </td>
                {/* Price */}
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-700 border-b border-gray-200 hidden sm:table-cell w-20">
                    {formattedPrice}
                </td>
                {/* Unit */}
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 border-b border-gray-200 hidden lg:table-cell w-16">
                    {unit || 'N/A'}
                </td>
                {/* Category */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-b border-gray-200 hidden md:table-cell max-w-[120px] truncate">
                    {categoryName || 'N/A'}
                </td>
                {/* Seller Name */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800 border-b border-gray-200 hidden lg:table-cell max-w-[120px] truncate">
                    {sellerName || 'Unknown'}
                </td>
                {/* Status */}
                <td className="px-3 py-2 whitespace-nowrap border-b border-gray-200 w-28">
                    {getStatusTag(status)}
                </td>
                {/* Action */}
                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium border-b border-gray-200 w-24 space-x-1 flex items-center justify-end">
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); openDetailModal(product); }}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md"
                        aria-label={`Review ${name}`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Eye size={16} />
                    </motion.button>
                    {/* NEW Download Button for Individual Product */}
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); handleDownloadSingleProduct(product); }}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded-md"
                        aria-label={`Download ${name} Data`}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Download size={16} />
                    </motion.button>
                </td>
            </tr>
        );
    };


    // --- Main Render ---

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">

            {/* Header/Banner */}
            <header className="flex justify-between items-center mb-6 pb-4 border-b-2 border-indigo-100">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center">
                   
                </h1>
                <div className="flex space-x-3">
                    {/* NEW Download All Button */}
                    <motion.button
                        onClick={handleDownloadAllProducts}
                        className="flex items-center text-sm px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 transition duration-150"
                        disabled={products.length === 0}
                        whileTap={{ scale: 0.95 }}
                        title="Download All Product Data"
                    >
                        <Download size={16} className="mr-2" />
                        Download All
                    </motion.button>
                    <button
                        onClick={fetchAllProducts}
                        className="flex items-center text-sm px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-300 shadow-sm hover:bg-indigo-50 transition duration-150"
                        disabled={loading}
                    >
                        {loading ? <Loader size={16} className="animate-spin mr-2" /> : <List size={16} className="mr-2" />}
                        Refresh
                    </button>
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

            {/* Toast Notification (unchanged) */}
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

            {/* Filter and Search Controls */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 border border-gray-200">
                {/* Search Bar */}
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Product Name, Seller, or Category..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                    className="md:w-auto w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                    <option value="all">Filter by Status (All)</option>
                    {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    className="md:w-auto w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                    <option value="all">Filter by Category (All)</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

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

            {!loading && filteredProducts.length === 0 && !error && (
                <div className="p-10 text-center bg-white rounded-xl shadow-lg border border-gray-200">
                    <Info size={36} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 font-medium">
                        {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                            ? "No products match your current filters."
                            : "🎉 All products reviewed! No tasks currently awaiting action."
                        }
                    </p>
                </div>
            )}

            {/* Data Table View (List) */}
            {!loading && filteredProducts.length > 0 && (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                                        Image
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Product / Description
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Price
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Unit
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Category
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Seller
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedProducts.map((product) => (
                                    <ProductTableRow key={product._id} product={product} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                        <span className="text-sm text-gray-700">
                            Showing {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredProducts.length, currentPage * itemsPerPage)} of {filteredProducts.length} results
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium text-indigo-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === totalPages || filteredProducts.length === 0}
                                className="px-3 py-1 text-sm font-medium text-indigo-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
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