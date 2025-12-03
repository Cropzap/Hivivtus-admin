import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Grid, TextField, Select, MenuItem, Paper, CircularProgress, Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import axios from 'axios';
import {
    Info,
    Package,
    User,
    Building,
    Mail,
    Smartphone,
    X,
    DollarSign,
    ShoppingCart,
    MapPin,
    Clock,
    ChevronLeft,
    ChevronRight,
    Eye,
    Zap, // Added for status update visibility
    Tag // Added for promo code
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Tailwind CSS classes for animations (kept as provided)
const customStyles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-once {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
}
.animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
}
.hover\\:animate-pulse-once:hover {
    animation: pulse-once 0.3s ease-in-out;
}
.hover\\:animate-shake:hover {
    animation: shake 0.5s ease-in-out;
}
/* Utility to hide scrollbars on elements */
.no-scrollbar::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
}
.no-scrollbar {
    -ms-overflow-style: none; /* for IE and Edge */
    scrollbar-width: none; /* for Firefox */
}
`;

const STATUS_COLORS = {
    Pending: "bg-yellow-200 text-yellow-800",
    Processing: "bg-blue-200 text-blue-800",
    Shipped: "bg-indigo-200 text-indigo-800",
    Delivered: "bg-green-200 text-green-800",
    Cancelled: "bg-red-200 text-red-800",
    Paid: "bg-purple-200 text-purple-800", // Added Paid
};

const ORDER_STATUSES = Object.keys(STATUS_COLORS); // Get all possible statuses

const initialFilters = {
    customerName: "",
    sellerName: "",
    status: "",
    startDate: "",
    endDate: "",
};

// Animation variants for modals
const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// --- Modal Components ---
const ModalWrapper = ({ children, onClose, maxWidth = 'max-w-4xl' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900 bg-opacity-75 backdrop-blur-sm animate-fadeIn">
        <motion.div
            className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 md:p-8 relative`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X size={24} />
            </button>
            {children}
        </motion.div>
    </div>
);

const CustomerDetailsModal = ({ customer, onClose }) => {
    if (!customer) return null;

    // Helper to format the date
    const formattedDOB = customer.dateOfBirth
        ? new Date(customer.dateOfBirth).toLocaleDateString()
        : 'N/A';

    // Safety check for address object existence and use optional chaining
    const address = customer.address || {};
    // Use Object.keys to check if *any* relevant address field is present
    const hasAddress = Object.keys(address).some(key => address[key] && address[key].toString().trim() !== '');

    // Get the name, prioritizing root 'name' if firstName/lastName are absent
    const fullName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';


    return (
        <ModalWrapper onClose={onClose} maxWidth="max-w-xl">
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-6 flex items-center">
                <User size={28} className="mr-3 text-blue-500" /> Customer Details
            </h3>

            {/* Profile Picture & Full Name (using 'name' from data) */}
            <div className="flex items-center space-x-4 mb-6">
                <img
                    src={customer.profilePicture || 'https://placehold.co/150x150/E0E0E0/333333?text=User'}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/E0E0E0/333333?text=User'; }}
                />
                <h4 className="text-xl font-bold text-gray-900">
                    {fullName}
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Contact Information */}
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                    <p className="text-gray-500 font-semibold text-sm">Primary Email</p>
                    <p className="text-gray-800 text-lg flex items-center truncate">
                        <Mail size={20} className="mr-2 text-gray-400" />{customer.email}
                    </p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                    <p className="text-gray-500 font-semibold text-sm">Primary Phone</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <Smartphone size={20} className="mr-2 text-gray-400" />{customer.mobile}
                    </p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                    <p className="text-gray-500 font-semibold text-sm">Alternate Phone</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <Smartphone size={20} className="mr-2 text-gray-400" />{customer.alternatePhone || 'N/A'}
                    </p>
                </div>

                {/* Personal & Professional Details */}
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Date of Birth</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <Clock size={20} className="mr-2 text-gray-400" />{formattedDOB}
                    </p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Gender</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <User size={20} className="mr-2 text-gray-400" />{customer.gender || 'N/A'}
                    </p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Occupation</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <Building size={20} className="mr-2 text-gray-400" />{customer.occupation || 'N/A'}
                    </p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                    <p className="text-gray-500 font-semibold text-sm">Company</p>
                    <p className="text-gray-800 text-lg flex items-center">
                        <Building size={20} className="mr-2 text-gray-400" />{customer.company || 'N/A'}
                    </p>
                </div>

                {/* Address Details (Displayed Individually) */}
                {hasAddress ? (
                    <>
                        <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                            <p className="text-gray-500 font-semibold text-sm">Street/Apartment</p>
                            <p className="text-gray-800 text-lg flex items-center">
                                <MapPin size={20} className="mr-2 text-gray-400" />
                                {/* Display apartment first, then street if apartment is missing */}
                                {address.apartment || address.street || '—'}
                            </p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                            <p className="text-gray-500 font-semibold text-sm">City/State</p>
                            <p className="text-gray-800 text-lg flex items-center">
                                <MapPin size={20} className="mr-2 text-gray-400" />
                                {`${address.city || '—'}, ${address.state || '—'}`}
                            </p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-1">
                            <p className="text-gray-500 font-semibold text-sm">Zip/Country</p>
                            <p className="text-gray-800 text-lg flex items-center">
                                <MapPin size={20} className="mr-2 text-gray-400" />
                                {/* Use 'zip' as per your Mongoose schema, which corresponds to the 'zip' key in your data */}
                                {`${address.zip || '—'} / ${address.country || '—'}`}
                            </p>
                        </div>
                        <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                            <p className="text-gray-500 font-semibold text-sm">Landmark</p>
                            <p className="text-gray-800 text-lg flex items-center">
                                <MapPin size={20} className="mr-2 text-gray-400" />
                                {address.landmark || '—'}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full text-center">
                        <p className="text-red-500 font-semibold text-base">No Registered Address Provided</p>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
};

const SellerDetailsModal = ({ seller, onClose }) => {
    if (!seller) return null;

    // FIX: Check if seller.address is an object and format it.
    const formattedAddress = 
        (typeof seller.address === 'object' && seller.address !== null)
            ? `${seller.address.street || ''}, ${seller.address.city || ''}, ${seller.address.state || ''} - ${seller.address.pincode || ''}`
            : (typeof seller.address === 'string' ? seller.address : 'Address Not Specified');
            
    // Optional: Clean up leading commas/hyphens if fields are empty
    const addressToDisplay = formattedAddress.replace(/,\s*-\s*$/, '').trim();

    return (
        <ModalWrapper onClose={onClose} maxWidth="max-w-lg">
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-4 flex items-center"><Building size={28} className="mr-3 text-indigo-500" /> Seller Details</h3>
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-gray-900">{seller.companyName}</h4>
                    <p className="text-gray-500 text-sm mt-1">Seller ID: {seller._id}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Email</p>
                    <p className="text-gray-800 text-lg flex items-center"><Mail size={20} className="mr-2 text-gray-400" />{seller.email}</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Phone</p>
                    <p className="text-gray-800 text-lg flex items-center"><Smartphone size={20} className="mr-2 text-gray-400" />{seller.mobile}</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                    <p className="text-gray-500 font-semibold text-sm">Address</p>
                    {/* FIXED: Now rendering the formatted string */}
                    <p className="text-gray-800 text-lg flex items-center">
                        <MapPin size={20} className="mr-2 text-gray-400" />
                        {addressToDisplay}
                    </p>
                </div>
            </div>
        </ModalWrapper>
    );
};

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const summary = order.billingSummary || {};

    // Helper function for rendering billing rows
    const BillingRow = ({ label, value, isDiscount = false, isNet = false, isTotal = false }) => (
        <div className={`flex justify-between items-center py-2 ${isNet ? 'font-bold border-t border-gray-300' : ''} ${isTotal ? 'font-extrabold text-xl text-green-700 border-t-2 border-gray-400 pt-3 mt-2' : 'text-gray-700'}`}>
            <span className={isDiscount ? 'text-red-600' : ''}>{label}</span>
            <span className={isDiscount ? 'text-red-600' : 'text-gray-900'}>
                {isDiscount ? '- ' : ''}₹{parseFloat(value).toFixed(2)}
            </span>
        </div>
    );
    
    // Fallback/direct access to new DB fields
    const subtotal = order.subtotalAmount || summary['Subtotal (Product Value)'] || 0;
    const actualDeliveryCost = order.actualDeliveryCost || summary['Actual Delivery Cost'] || 0;
    const productValueDiscount = order.productValueDiscount || summary['Product Value Discount (5%)'] || 0;
    const netDeliveryCharge = order.netDeliveryCharge || summary['Net Delivery Charge'] || 0;
    const promoDiscount = order.promoDiscountAmount || summary['Promo Code Discount'] || 0;
    const platformFee = order.platformFee || summary['Platform Fee'] || 0;
    const smileFundDonation = order.smileFundDonation || summary['Smile Fund Donation'] || 0;


    return (
        <ModalWrapper onClose={onClose} maxWidth="max-w-5xl">
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-6 flex items-center"><Package size={28} className="mr-3 text-blue-500" /> Order Details</h3>

            {/* HEADER / STATUS SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center border-b pb-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-bold text-gray-900 truncate text-sm">{order._id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-green-600 text-xl flex items-center justify-center">₹ {order.totalAmount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Official Status</p>
                    <span className={`px-3 py-1 font-bold text-sm rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-200 text-gray-800'}`}>
                        {order.status}
                    </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-bold text-gray-900 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {/* Display seller requested status if pending approval */}
                {order.adminApprovalStatus === 'Awaiting Approval' && (
                    <div className="bg-red-100 p-4 rounded-xl shadow-inner col-span-full border-red-300 border">
                        <p className="text-sm text-red-700 font-bold flex items-center justify-center">
                            <Zap size={18} className='mr-2' /> Seller Requested Status: {order.sellerStatus} - Awaiting Admin Approval
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* COLUMN 1: CUSTOMER, SELLER, ADDRESS */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                        <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><User size={20} className="mr-2 text-blue-500" /> Customer</h4>
                        {/* FIX: Use Optional Chaining for customer names */}
                        <p className="font-semibold text-gray-900">{order.user?.firstName || order.user?.name || 'N/A'} {order.user?.lastName || ''}</p>
                        <p className="text-sm text-gray-500">{order.user?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.user?.mobile || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                        <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><Building size={20} className="mr-2 text-indigo-500" /> Seller</h4>
                        {/* FIX: Use Optional Chaining for seller details */}
                        <p className="font-semibold text-gray-900">{order.seller?.companyName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.seller?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{order.seller?.mobile || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                        <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><MapPin size={20} className="mr-2 text-red-500" /> Shipping Address</h4>
                        <address className="not-italic text-gray-700 text-sm">
                            <p className="font-semibold">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </address>
                    </div>
                </div>

                {/* COLUMN 2: ORDER ITEMS */}
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200 max-h-[400px] overflow-y-auto">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2 sticky top-0 bg-gray-50/90 z-10 py-1"><ShoppingCart size={20} className="mr-2 text-green-500" /> Items ({order.items.length})</h4>
                    <ul className="divide-y divide-gray-200">
                        {order.items.map((item, index) => (
                            <li key={index} className="flex items-start space-x-4 py-3">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.quantity} | Unit Price: ₹{item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-bold text-gray-900 flex-shrink-0">₹{(item.quantity * item.price).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COLUMN 3: BILLING SUMMARY (Detailed Financial Breakdown) */}
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-4"><DollarSign size={20} className="mr-2 text-green-500" /> Financial Summary</h4>
                    
                    <div className="text-sm space-y-1">
                        <BillingRow label="Product Subtotal" value={subtotal} />
                        
                        {/* Delivery Details */}
                        <div className="py-2 mt-2">
                            <h5 className="font-semibold text-gray-600 mb-1 border-b border-dashed">Delivery Calculation</h5>
                            <BillingRow label="Actual Delivery Cost (Pre-Discount)" value={actualDeliveryCost} />
                            {productValueDiscount > 0 && <BillingRow label="Product Value Discount (5%)" value={productValueDiscount} isDiscount />}
                            <BillingRow label="Net Delivery Charge" value={netDeliveryCharge} isNet />
                        </div>
                        
                        {/* Promo Discount */}
                        {promoDiscount > 0 && (
                            <div className="py-2 border-t border-gray-300">
                                <BillingRow label={`Promo Discount (${order.promoCode || 'N/A'})`} value={promoDiscount} isDiscount />
                            </div>
                        )}
                        
                        {/* Fees & Donation */}
                        <div className="py-2 border-t border-gray-300">
                            <BillingRow label="Platform Fee" value={platformFee} />
                            <BillingRow label="Smile Fund Donation" value={smileFundDonation} />
                        </div>

                        {/* Final Total */}
                        <BillingRow label="TOTAL AMOUNT" value={order.totalAmount} isTotal />
                    </div>

                    {/* Payment Status (Simplified) */}
                    <p className={`mt-4 text-sm font-semibold p-2 rounded text-center ${STATUS_COLORS[order.paymentMethod] ? STATUS_COLORS[order.paymentMethod].replace('200', '100').replace('800', '900') : 'bg-gray-100 text-gray-600'}`}>
                        Payment Method: {order.paymentMethod || 'N/A'}
                        {order.cfOrderId && <span className='block text-xs font-normal opacity-80'>Order ID: {order.cfOrderId}</span>}
                    </p>
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- NEW Status Update Modal (Unchanged) ---
const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [alert, setAlert] = useState({ message: '', severity: '' });

    // Determine the status to suggest/default to in the selector
    useEffect(() => {
        if (order.adminApprovalStatus === 'Awaiting Approval') {
            setNewStatus(order.sellerStatus);
        } else {
            setNewStatus(order.status);
        }
    }, [order]);

    const handleConfirm = async () => {
        setIsUpdating(true);
        if (newStatus === order.status && order.adminApprovalStatus !== 'Awaiting Approval') {
            setAlert({ message: 'Status is already set to this value.', severity: 'warning' });
            setIsUpdating(false);
            return;
        }
        await onUpdate(order._id, newStatus, setAlert);
        setIsUpdating(false);
    };

    const isApprovalNeeded = order.adminApprovalStatus === 'Awaiting Approval';

    return (
        <ModalWrapper onClose={onClose} maxWidth="max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 border-b-2 pb-4 mb-4 flex items-center">
                <Zap size={24} className="mr-2 text-red-500" /> Admin Status Update
            </h3>
            
            <p className="mb-4 text-gray-700 font-medium">Order ID: **{order._id}**</p>

            {isApprovalNeeded && (
                <Alert severity="warning" className='mb-4 flex items-center'>
                    Seller requested status change to **{order.sellerStatus}**.
                </Alert>
            )}

            <div className="mb-4">
                <Typography variant="body1" className="mb-2 font-semibold text-gray-700">
                    Current Official Status: 
                    <span className={`ml-2 px-3 py-1 font-bold text-sm rounded-full ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                    </span>
                </Typography>
            </div>
            
            <Select
                fullWidth
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="New Official Status"
                size="small"
                className='mb-6'
            >
                {ORDER_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>
                        {status}
                    </MenuItem>
                ))}
            </Select>

            {alert.message && (
                <Alert severity={alert.severity} className='mb-4'>{alert.message}</Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleConfirm}
                disabled={isUpdating}
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full py-3"
            >
                {isUpdating ? 'Updating...' : `Approve & Set Status to: ${newStatus}`}
            </Button>
            <Button onClick={onClose} color="inherit" fullWidth className="mt-2 text-gray-600 hover:bg-gray-100">
                Cancel
            </Button>
        </ModalWrapper>
    );
};


// --- Main Component ---
export default function Order() {
    // Inject custom styles into the head
    React.useEffect(() => {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = customStyles;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

   const [orders, setOrders] = useState([]); 
    const [filter, setFilter] = useState(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals state
    const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showSellerDetailsModal, setShowSellerDetailsModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // NEW Status Update State
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null);

    // Fetch orders from the backend
    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken'); 
            if (!token) {
                setError('Authentication token not found.');
                setLoading(false);
                return;
            }
            const res = await axios.get(`${API_URL}orders/seller`, {
                headers: {
                    'x-auth-token': token,
                },
            });
            
            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
                console.warn('API did not return an array of orders:', res.data);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError('Failed to fetch orders. Please try again.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Admin Status Update Handler
    const handleAdminUpdateStatus = async (orderId, newStatus, setAlert) => {
        try {
            const token = localStorage.getItem('authToken');
            // 🔑 API endpoint used for Admin status approval/update 🔑
            const res = await axios.put(`${API_URL}orders/admin-update-status/${orderId}`, { newStatus }, {
                headers: {
                    'x-auth-token': token,
                },
            });
            
            setAlert({ message: res.data.msg, severity: 'success' });
            
            // Wait briefly for the message to display, then close modal and refresh list
            setTimeout(() => {
                setShowStatusUpdateModal(false);
                setOrderToUpdate(null);
                fetchOrders(); // Refresh the list
            }, 1000);

        } catch (err) {
            console.error("Error updating status:", err);
            const msg = err.response?.data?.msg || 'Failed to update order status.';
            setAlert({ message: msg, severity: 'error' });
        }
    };


    // Filtering logic with useMemo for performance (Unchanged)
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter((order) => {
            // Customer name filter
            // FIX: Use Optional Chaining for customer name access in filter
            const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim().toLowerCase();
            if (filter.customerName && !customerName.includes(filter.customerName.toLowerCase())) {
                return false;
            }
            // Seller name filter
            // FIX: Use Optional Chaining for seller name access in filter
            if (filter.sellerName && !order.seller?.companyName.toLowerCase().includes(filter.sellerName.toLowerCase())) {
                return false;
            }
            // Status filter
            if (filter.status && order.status !== filter.status) {
                return false;
            }
            // Start date filter
            if (filter.startDate) {
                const itemDate = new Date(order.createdAt);
                const start = new Date(filter.startDate);
                if (itemDate < start) return false;
            }
            // End date filter
            if (filter.endDate) {
                const itemDate = new Date(order.createdAt);
                const end = new Date(filter.endDate);
                if (itemDate > end) return false;
            }
            return true;
        });
    }, [orders, filter]);

    const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const handleClearFilters = () => {
        setFilter(initialFilters);
    };

    const handleDownloadExcel = () => {
        const dataForExport = filteredOrders.map(order => ({
            "Order ID": order._id,
            // FIX: Use optional chaining for safe access
            "Customer Name": `${order.user?.firstName || order.user?.name || ''} ${order.user?.lastName || ''}`.trim(),
            "Customer Email": order.user?.email || 'N/A',
            "Seller Name": order.seller?.companyName || 'N/A',
            "Seller Email": order.seller?.email || 'N/A',
            "Total Amount": order.totalAmount,
            "Official Status": order.status,
            "Seller Requested Status": order.sellerStatus,
            "Approval Status": order.adminApprovalStatus,
            "Order Date": new Date(order.createdAt).toLocaleString(),
            "Shipping Address": `${order.shippingAddress?.address1 || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}, ${order.shippingAddress?.country || ''}`,
            "Items": order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
            
            // --- NEW FINANCIAL FIELDS FOR EXPORT ---
            "Product Subtotal": order.subtotalAmount || order.billingSummary?.['Subtotal (Product Value)'],
            "Actual Delivery Cost": order.actualDeliveryCost || order.billingSummary?.['Actual Delivery Cost'],
            "Product Value Discount (5%)": order.productValueDiscount || order.billingSummary?.['Product Value Discount (5%)'],
            "Net Delivery Charge": order.netDeliveryCharge || order.billingSummary?.['Net Delivery Charge'],
            "Promo Code": order.promoCode || 'N/A',
            "Promo Discount": order.promoDiscountAmount || order.billingSummary?.['Promo Code Discount'],
            "Platform Fee": order.platformFee || order.billingSummary?.['Platform Fee'],
            "Smile Fund Donation": order.smileFundDonation || order.billingSummary?.['Smile Fund Donation'],
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, "Order_List.xlsx");
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "—";
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    };

    // Animation variants for framer-motion (Unchanged)
    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        hover: { scale: 1.02, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" },
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
            <motion.section
                className="mx-auto bg-gray-50/70 backdrop-blur-lg rounded-3xl h-screen p-6 md:p-8 shadow-xl border border-gray-200"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                transition={{ duration: 0.6 }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                    <Typography variant="h4" fontWeight={700} className="text-gray-800">
                        Order List
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadExcel}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2 px-6 shadow-lg hover:shadow-xl transition-all"
                    >
                        Export Excel
                    </Button>
                </Box>

                {/* Filters section (Unchanged) */}
                <Grid container spacing={2} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            size="small"
                            label="Customer Name"
                            variant="outlined"
                            fullWidth
                            value={filter.customerName}
                            onChange={(e) => setFilter(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            size="small"
                            label="Seller Name"
                            variant="outlined"
                            fullWidth
                            value={filter.sellerName}
                            onChange={(e) => setFilter(prev => ({ ...prev, sellerName: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Select
                            size="small"
                            fullWidth
                            displayEmpty
                            value={filter.status ?? ""}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            renderValue={(selected) => {
                                if (!selected) {
                                    return "All Status";
                                }
                                return selected;
                            }}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            {ORDER_STATUSES.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            label="Start Date"
                            type="datetime-local"
                            size="small"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={filter.startDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            label="End Date"
                            type="datetime-local"
                            size="small"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={filter.endDate}
                            onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12} md={1.5}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            onClick={handleClearFilters}
                            sx={{ height: "100%" }}
                        >
                            Clear
                        </Button>
                    </Grid>
                </Grid>

                {/* Table */}
                <div className="overflow-x-auto no-scrollbar rounded-2xl shadow-lg bg-white/40 backdrop-blur-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="sticky top-0 bg-white/80 backdrop-blur-md">
                            <tr>
                                <motion.th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</motion.th>
                                <motion.th scope="col" className="w-2/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</motion.th>
                                <motion.th scope="col" className="w-2/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</motion.th>
                                <motion.th scope="col" className="w-2/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Seller</motion.th>
                                <motion.th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</motion.th>
                                <motion.th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</motion.th>
                                <motion.th scope="col" className="w-2/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</motion.th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-500 italic font-semibold"><CircularProgress color="inherit" size={30} /></td></tr>
                            ) : error ? (
                                <tr><td colSpan={7} className="text-center py-16 text-red-500 font-semibold">{error}</td></tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-400 italic font-semibold">No records found.</td></tr>
                            ) : (
                                paginatedOrders.map((order, index) => {
                                    const needsApproval = order.adminApprovalStatus === 'Awaiting Approval';
                                    return (
                                        <motion.tr
                                            key={order._id}
                                            className={`even:bg-white/70 odd:bg-white/50 hover:bg-blue-50 transition-colors ${needsApproval ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : ''}`}
                                            initial="hidden"
                                            animate="visible"
                                            variants={rowVariants}
                                            whileHover="hover"
                                            transition={{ delay: index * 0.05, duration: 0.25 }}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{formatDateTime(order.createdAt)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[100px] truncate">{order._id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[140px] truncate">
                                                <div className="flex items-center gap-2">
                                                    {/* FIX APPLIED HERE: Safely access user properties */}
                                                    <span>{order.user?.firstName || order.user?.name } {order.user?.lastName || ''|| order.shippingAddress.name}</span>
                                                    <button
                                                        onClick={() => { setSelectedCustomer(order.user); setShowCustomerDetailsModal(true); }}
                                                        className="text-blue-500 hover:text-blue-700 transition"
                                                        title="View Customer Details"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[140px] truncate">
                                                <div className="flex items-center gap-2">
                                                    {/* FIX APPLIED HERE: Safely access seller companyName */}
                                                    <span>{order.seller?.companyName || 'N/A'}</span>
                                                    <button
                                                        onClick={() => { setSelectedSeller(order.seller); setShowSellerDetailsModal(true); }}
                                                        className="text-indigo-500 hover:text-indigo-700 transition"
                                                        title="View Seller Details"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {needsApproval && (
                                                    <div className='flex items-center text-red-600 font-bold mb-1'>
                                                        <Zap size={14} className='mr-1' /> Approval Needed
                                                    </div>
                                                )}
                                                <span className={`px-3 py-1 font-bold text-xs rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-200 text-gray-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">₹{order.totalAmount ? parseFloat(order.totalAmount).toFixed(2) : '0.00'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2 flex items-center justify-center">
                                                {/* View Details Button */}
                                                <motion.button
                                                    onClick={() => { setSelectedOrder(order); setShowOrderDetailsModal(true); }}
                                                    className="bg-blue-600 text-white hover:bg-blue-700 transition rounded-md p-2 text-sm font-medium"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </motion.button>
                                                
                                                {/* Status Update Button */}
                                                <motion.button
                                                    onClick={() => { setOrderToUpdate(order); setShowStatusUpdateModal(true); }}
                                                    className={`transition rounded-md p-2 text-sm font-medium ${needsApproval ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="Update Status"
                                                >
                                                    {needsApproval ? <Zap size={16} /> : <Clock size={16} />}
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Unchanged) */}
                <Box display="flex" justifyContent="center" alignItems="center" mt={4} className="space-x-4">
                    <motion.button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    <Typography className="text-gray-700">
                        Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                    </Typography>
                    <motion.button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight size={20} />
                    </motion.button>
                </Box>
            </motion.section>

            {/* Modals */}
            <AnimatePresence>
                {showCustomerDetailsModal && (
                    <CustomerDetailsModal customer={selectedCustomer} onClose={() => setShowCustomerDetailsModal(false)} />
                )}
                {showSellerDetailsModal && (
                    <SellerDetailsModal seller={selectedSeller} onClose={() => setShowSellerDetailsModal(false)} />
                )}
                {showOrderDetailsModal && (
                    <OrderDetailsModal order={selectedOrder} onClose={() => setShowOrderDetailsModal(false)} />
                )}
                {/* NEW Status Update Modal */}
                {showStatusUpdateModal && orderToUpdate && (
                    <StatusUpdateModal 
                        order={orderToUpdate} 
                        onClose={() => setShowStatusUpdateModal(false)}
                        onUpdate={handleAdminUpdateStatus} 
                    />
                )}
            </AnimatePresence>
        </Paper>
    );
}