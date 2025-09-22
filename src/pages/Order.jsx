import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, TextField, Select, MenuItem, Paper, CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import axios from 'axios';
import {
    Trash2,
    Download,
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
} from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
// Tailwind CSS classes for animations
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
};

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

// --- Modal Components (Keep these as you provided) ---
const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900 bg-opacity-75 backdrop-blur-sm animate-fadeIn">
        <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
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
    return (
        <ModalWrapper onClose={onClose}>
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-4 flex items-center"><User size={28} className="mr-3 text-blue-500" /> Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Name</p>
                    <p className="text-gray-800 text-lg flex items-center"><User size={20} className="mr-2 text-gray-400" />{customer.firstName} {customer.lastName}</p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <p className="text-gray-500 font-semibold text-sm">Email</p>
                    <p className="text-gray-800 text-lg flex items-center"><Mail size={20} className="mr-2 text-gray-400" />{customer.email}</p>
                </div>
                <div className="space-y-1 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                    <p className="text-gray-500 font-semibold text-sm">Mobile</p>
                    <p className="text-gray-800 text-lg flex items-center"><Smartphone size={20} className="mr-2 text-gray-400" />{customer.mobile}</p>
                </div>
            </div>
        </ModalWrapper>
    );
};

const SellerDetailsModal = ({ seller, onClose }) => {
    if (!seller) return null;
    return (
        <ModalWrapper onClose={onClose}>
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
                    <p className="text-gray-800 text-lg flex items-center"><MapPin size={20} className="mr-2 text-gray-400" />{seller.address}</p>
                </div>
            </div>
        </ModalWrapper>
    );
};

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    return (
        <ModalWrapper onClose={onClose}>
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-6 flex items-center"><Package size={28} className="mr-3 text-blue-500" /> Order Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-b pb-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-bold text-gray-900 truncate">{order._id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-bold text-green-600 text-xl flex items-center justify-center"><DollarSign size={20} className="mr-1" />{order.totalAmount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-3 py-1 font-bold text-sm rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-200 text-gray-800'}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><User size={20} className="mr-2 text-blue-500" /> Customer</h4>
                    <p className="font-semibold text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><Building size={20} className="mr-2 text-indigo-500" /> Seller</h4>
                    <p className="font-semibold text-gray-900">{order.seller.companyName}</p>
                    <p className="text-sm text-gray-500">{order.seller.email}</p>
                </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200 mb-6">
                <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><ShoppingCart size={20} className="mr-2 text-green-500" /> Order Items ({order.items.length})</h4>
                <ul className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-4 py-3">
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity} | Price: ${item.price}</p>
                            </div>
                            <p className="font-bold text-gray-900">${item.quantity * item.price}</p>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><MapPin size={20} className="mr-2 text-red-500" /> Shipping Address</h4>
                <address className="not-italic text-gray-700">
                    <p className="font-semibold">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                </address>
            </div>
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

    // Fetch orders from the backend on component mount
    useEffect(() => {
        const fetchOrders = async () => {
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
        };

        fetchOrders();
    }, []);

    // Filtering logic with useMemo for performance
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter((order) => {
            // Customer name filter
            const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim().toLowerCase();
            if (filter.customerName && !customerName.includes(filter.customerName.toLowerCase())) {
                return false;
            }
            // Seller name filter
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
            "Customer Name": `${order.user.firstName} ${order.user.lastName}`,
            "Customer Email": order.user.email,
            "Seller Name": order.seller.companyName,
            "Seller Email": order.seller.email,
            "Total Amount": order.totalAmount,
            "Status": order.status,
            "Order Date": new Date(order.createdAt).toLocaleString(),
            "Shipping Address": `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
            "Items": order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
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

    // Animation variants for framer-motion
    const containerVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        hover: { scale: 1.02, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" },
    };

    const paginationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
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

                {/* Filters section */}
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
                            {Object.keys(STATUS_COLORS).map(status => (
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
                                <motion.th scope="col" className="w-2/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</motion.th>
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
                                paginatedOrders.map((order, index) => (
                                    <motion.tr
                                        key={order._id}
                                        className="even:bg-white/70 odd:bg-white/50 hover:bg-blue-50 transition-colors"
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
                                                <span>{order.user.firstName} {order.user.lastName}</span>
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
                                                <span>{order.seller.companyName}</span>
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
                                            <span className={`px-3 py-1 font-bold text-xs rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-200 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">${order.totalAmount}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                                            <motion.button
                                                onClick={() => { setSelectedOrder(order); setShowOrderDetailsModal(true); }}
                                                className="bg-blue-600 text-white hover:bg-blue-700 transition rounded-md px-3 py-1 text-sm font-medium"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Eye size={16} />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
            </AnimatePresence>
        </Paper>
    );
}