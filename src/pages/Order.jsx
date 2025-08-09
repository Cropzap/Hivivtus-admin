import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Button, Grid, TextField, Select, MenuItem, Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
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

// Tailwind CSS classes for animations
// fadeIn: For a subtle appearance animation.
// pulse-once: A custom animation for button hover effects.
// shake: For an attention-grabbing shake on hover for trash icons.
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
`;

// --- Dummy Data (mimicking the Mongoose schema) ---
// This is the data for demonstration purposes, with detailed user and seller information.
// In a real application, you would fetch this from your backend API.
const dummyUsers = [
    { _id: "user1", name: "Ponkavin", email: "kavin@gmail.com", mobile: "7010039650" },
    { _id: "user2", name: "Jane Doe", email: "jane.doe@example.com", mobile: "9876543210" },
    { _id: "user3", name: "John Smith", email: "john.smith@example.com", mobile: "8887776665" },
];

const dummySellers = [
    {
        _id: "seller1",
        name: "Electro Corp",
        email: "contact@electro.com",
        phone: "123-456-7890",
        address: { city: "Bengaluru", country: "India" },
        profilePicture: "https://placehold.co/100x100/A855F7/FFFFFF?text=EC",
    },
    {
        _id: "seller2",
        name: "Fashion Hub",
        email: "support@fashionhub.com",
        phone: "098-765-4321",
        address: { city: "Mumbai", country: "India" },
        profilePicture: "https://placehold.co/100x100/06B6D4/FFFFFF?text=FH",
    },
    {
        _id: "seller3",
        name: "Home Essentials",
        email: "service@homeessentials.com",
        phone: "111-222-3333",
        address: { city: "Delhi", country: "India" },
        profilePicture: "https://placehold.co/100x100/F97316/FFFFFF?text=HE",
    },
];

const initialOrders = [
    {
        _id: "order1",
        user: dummyUsers[0],
        seller: dummySellers[0],
        items: [
            { name: "Laptop", quantity: 1, price: 1200, imageUrl: "https://placehold.co/100x100/22C55E/FFFFFF?text=Laptop" },
            { name: "Mouse", quantity: 2, price: 25, imageUrl: "https://placehold.co/100x100/22C55E/FFFFFF?text=Mouse" },
        ],
        totalAmount: 1250,
        shippingAddress: { name: "Ponkavin", address1: "123 Main St", city: "Chennai", postalCode: "600001", country: "India", phone: "7010039650" },
        status: "Processing",
        createdAt: "2025-08-09T10:00:00Z",
    },
    {
        _id: "order2",
        user: dummyUsers[1],
        seller: dummySellers[1],
        items: [
            { name: "T-Shirt", quantity: 3, price: 30, imageUrl: "https://placehold.co/100x100/FACC15/78350F?text=T-Shirt" },
        ],
        totalAmount: 90,
        shippingAddress: { name: "Jane Doe", address1: "456 Oak Ave", city: "Bengaluru", postalCode: "560001", country: "India", phone: "9876543210" },
        status: "Pending",
        createdAt: "2025-08-08T15:30:00Z",
    },
    {
        _id: "order3",
        user: dummyUsers[2],
        seller: dummySellers[0],
        items: [
            { name: "Monitor", quantity: 1, price: 400, imageUrl: "https://placehold.co/100x100/22C55E/FFFFFF?text=Monitor" },
        ],
        totalAmount: 400,
        shippingAddress: { name: "John Smith", address1: "789 Pine Ln", city: "Mumbai", postalCode: "400001", country: "India", phone: "8887776665" },
        status: "Shipped",
        createdAt: "2025-07-20T12:00:00Z",
    },
    {
        _id: "order4",
        user: dummyUsers[0],
        seller: dummySellers[2],
        items: [
            { name: "Kitchen Blender", quantity: 1, price: 80, imageUrl: "https://placehold.co/100x100/F97316/FFFFFF?text=Blender" },
        ],
        totalAmount: 80,
        shippingAddress: { name: "Ponkavin", address1: "123 Main St", city: "Chennai", postalCode: "600001", country: "India", phone: "7010039650" },
        status: "Delivered",
        createdAt: "2025-06-15T09:00:00Z",
    },
];

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

// --- Modal Components for displaying details ---
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
                    <p className="text-gray-800 text-lg flex items-center"><User size={20} className="mr-2 text-gray-400" />{customer.name}</p>
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
                <img src={seller.profilePicture} alt={seller.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white" />
                <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold text-gray-900">{seller.name}</h4>
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
                    <p className="text-gray-800 text-lg flex items-center"><Smartphone size={20} className="mr-2 text-gray-400" />{seller.phone}</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-full">
                    <p className="text-gray-500 font-semibold text-sm">Address</p>
                    <p className="text-gray-800 text-lg flex items-center"><MapPin size={20} className="mr-2 text-gray-400" />{seller.address.city}, {seller.address.country}</p>
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
                    <p className="font-semibold text-gray-900">{order.user.name}</p>
                    <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><Building size={20} className="mr-2 text-indigo-500" /> Seller</h4>
                    <p className="font-semibold text-gray-900">{order.seller.name}</p>
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

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm animate-fadeIn">
        <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 text-center"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h3 className="text-2xl font-bold text-gray-800">Confirm Action</h3>
            <p className="text-gray-600 leading-relaxed">{message}</p>
            <div className="flex justify-center space-x-4 mt-6">
                <motion.button
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Cancel
                </motion.button>
                <motion.button
                    onClick={onConfirm}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Confirm
                </motion.button>
            </div>
        </motion.div>
    </div>
);


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

    const [orders, setOrders] = useState(initialOrders);
    const [filter, setFilter] = useState(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [loading, setLoading] = useState(false);

    // Modals state
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);
    const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showSellerDetailsModal, setShowSellerDetailsModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filtering logic with useMemo for performance
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Customer name filter
            if (filter.customerName && !order.user?.name.toLowerCase().includes(filter.customerName.toLowerCase())) {
                return false;
            }
            // Seller name filter
            if (filter.sellerName && !order.seller?.name.toLowerCase().includes(filter.sellerName.toLowerCase())) {
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

    const handleDeleteConfirm = () => {
        // In a real app, you would make an API call to delete the order
        // For this example, we just filter it out from the state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== selectedItemToDelete));
        setShowConfirmationModal(false);
        setSelectedItemToDelete(null);
    };
    
    const handleDownloadExcel = () => {
        const dataForExport = filteredOrders.map(order => ({
            "Order ID": order._id,
            "Customer Name": order.user.name,
            "Customer Email": order.user.email,
            "Seller Name": order.seller.name,
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
                <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/40 backdrop-blur-lg border border-gray-200">
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
                                <tr><td colSpan={7} className="text-center py-16 text-gray-500 italic font-semibold">Loading...</td></tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-400 italic font-semibold">No records found.</td></tr>
                            ) : (
                                paginatedOrders.map((order, index) => (
                                    <motion.tr
                                        key={order._id}
                                        className="cursor-pointer even:bg-white/70 odd:bg-white/50 hover:bg-blue-50 transition-colors"
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
                                                <span>{order.user.name}</span>
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
                                                <span>{order.seller.name}</span>
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
                                            <span className={`inline-block rounded-full px-3 py-1 font-semibold select-none text-xs ${STATUS_COLORS[order.status] || 'bg-gray-200 text-gray-700'}`}>
                                                {order.status || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">${order.totalAmount}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                                            <motion.button
                                                onClick={() => { setSelectedOrder(order); setShowOrderDetailsModal(true); }}
                                                className="bg-blue-600 text-white hover:bg-blue-700 transition rounded-md px-3 py-1 text-sm font-medium hover:animate-pulse-once"
                                                title="View Order Details"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Eye size={16} className="inline-block mr-1" /> View
                                            </motion.button>
                                            <motion.button
                                                onClick={() => { setSelectedItemToDelete(order._id); setShowConfirmationModal(true); }}
                                                className="bg-red-600 text-white hover:bg-red-700 transition rounded-md px-3 py-1 text-sm font-medium hover:animate-shake"
                                                title="Cancel Order"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Trash2 size={16} className="inline-block" />
                                            </motion.button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <motion.nav
                    className="flex justify-center items-center mt-6 space-x-2"
                    initial="initial"
                    animate="animate"
                    variants={paginationVariants}
                    transition={{ duration: 0.4 }}
                    role="navigation"
                    aria-label="Pagination Navigation"
                >
                    <motion.button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`rounded-full p-2 font-semibold select-none transition-colors ${
                            currentPage === 1
                                ? "cursor-not-allowed text-gray-400 bg-gray-100"
                                : "hover:bg-blue-300 bg-blue-200 text-blue-900"
                        }`}
                        aria-label="Previous page"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft size={20} />
                    </motion.button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <motion.button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-full h-9 w-9 flex items-center justify-center font-semibold select-none transition-colors ${
                                currentPage === page
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "hover:bg-blue-300 bg-blue-200 text-blue-900"
                            }`}
                            aria-current={currentPage === page ? "page" : undefined}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {page}
                        </motion.button>
                    ))}
                    
                    <motion.button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`rounded-full p-2 font-semibold select-none transition-colors ${
                            currentPage === totalPages || totalPages === 0
                                ? "cursor-not-allowed text-gray-400 bg-gray-100"
                                : "hover:bg-blue-300 bg-blue-200 text-blue-900"
                        }`}
                        aria-label="Next page"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight size={20} />
                    </motion.button>
                </motion.nav>

                {/* Modals */}
                <AnimatePresence>
                    {showConfirmationModal && (
                        <ConfirmationModal
                            message="Are you sure you want to delete this order? This action cannot be undone."
                            onConfirm={handleDeleteConfirm}
                            onCancel={() => { setShowConfirmationModal(false); setSelectedItemToDelete(null); }}
                        />
                    )}
                    {showCustomerDetailsModal && (
                        <CustomerDetailsModal
                            customer={selectedCustomer}
                            onClose={() => setShowCustomerDetailsModal(false)}
                        />
                    )}
                    {showSellerDetailsModal && (
                        <SellerDetailsModal
                            seller={selectedSeller}
                            onClose={() => setShowSellerDetailsModal(false)}
                        />
                    )}
                    {showOrderDetailsModal && (
                        <OrderDetailsModal
                            order={selectedOrder}
                            onClose={() => setShowOrderDetailsModal(false)}
                        />
                    )}
                </AnimatePresence>
            </motion.section>
        </Paper>
    );
}

