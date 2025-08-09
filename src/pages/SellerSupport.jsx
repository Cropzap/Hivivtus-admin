/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    FaTicketAlt, FaFilter, FaSearch, FaUser, FaUserTie, 
    FaChevronLeft, FaChevronRight, FaReply, FaSpinner,
    FaCheckCircle, FaHourglassHalf, FaTimes, FaCommentDots,
    FaPaperclip, FaFileAlt, FaClipboardList, FaHashtag
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- (Re-using some dummy data and helpers from the buyer-side for demonstration) ---
const dummyTicketsData = [
    // ... (This data would be fetched from your backend API)
    {
        _id: 'tkt1', ticketId: 'TKT-1A2B3C', subject: 'Product not delivered', category: 'Delivery Issue', orderId: 'ORD123456',
        description: 'My order ORD123456 was marked as delivered, but I have not received the package yet. Please investigate.',
        status: 'Open', createdAt: '2023-10-27T10:00:00Z', updatedAt: '2023-10-27T10:00:00Z',
        buyer: { name: 'Ponkavin', email: 'kavin@example.com', userId: 'user001' },
        replies: [],
    },
    {
        _id: 'tkt2', ticketId: 'TKT-4D5E6F', subject: 'Question about Laptop Specs', category: 'Product Query',
        description: 'Can you confirm if the "UltraBook Pro" has a backlit keyboard?',
        status: 'In Progress', createdAt: '2023-10-26T14:30:00Z', updatedAt: '2023-10-27T09:15:00Z',
        buyer: { name: 'Jane Doe', email: 'jane.d@example.com', userId: 'user002' },
        assignedTo: { name: 'Admin Bob', userId: 'admin01' },
        replies: [
            { userId: 'admin01', userName: 'Admin Bob', message: 'Hello Jane, I am checking the specifications for you now and will get back to you shortly.', timestamp: '2023-10-27T09:15:00Z' }
        ],
    },
    {
        _id: 'tkt3', ticketId: 'TKT-7G8H9I', subject: 'Payment failed but amount deducted', category: 'Payment Issue', orderId: 'ORD789012',
        description: 'I tried to place an order, but the payment failed. The amount was still deducted from my bank account.',
        status: 'Resolved', createdAt: '2023-10-25T11:00:00Z', updatedAt: '2023-10-26T18:00:00Z',
        buyer: { name: 'John Smith', email: 'j.smith@example.com', userId: 'user003' },
        assignedTo: { name: 'Admin Alice', userId: 'admin02' },
        replies: [
            { userId: 'admin02', userName: 'Admin Alice', message: 'Hi John, we have located the transaction. The amount has been refunded and should reflect in your account within 3-5 business days.', timestamp: '2023-10-26T18:00:00Z' }
        ],
    },
    {
        _id: 'tkt4', ticketId: 'TKT-J1K2L3', subject: 'Website is slow', category: 'Technical Support',
        description: 'The product pages are taking a very long time to load today.',
        status: 'Closed', createdAt: '2023-10-24T16:20:00Z', updatedAt: '2023-10-25T10:00:00Z',
        buyer: { name: 'Emily White', email: 'emily.w@example.com', userId: 'user004' },
        assignedTo: { name: 'Admin Bob', userId: 'admin01' },
        replies: [
             { userId: 'admin01', userName: 'Admin Bob', message: 'Thank you for your feedback. Our technical team has resolved the performance issue.', timestamp: '2023-10-25T10:00:00Z' }
        ],
    }
];

// --- CSS to hide scrollbars gracefully ---
const customStyles = `
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Helper to get status badge styling ---
const getStatusBadge = (status) => {
    let colorClass = '';
    let icon = null;
    switch (status) {
        case 'Open': colorClass = 'bg-blue-100 text-blue-800'; icon = <FaHourglassHalf />; break;
        case 'In Progress': colorClass = 'bg-yellow-100 text-yellow-800'; icon = <FaSpinner className="animate-spin" />; break;
        case 'Resolved': colorClass = 'bg-emerald-100 text-emerald-800'; icon = <FaCheckCircle />; break;
        case 'Closed': colorClass = 'bg-gray-200 text-gray-800'; icon = <FaTimes />; break;
        default: colorClass = 'bg-gray-100 text-gray-700'; icon = <FaCommentDots />;
    }
    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}`}>
            {icon} {status}
        </span>
    );
};

// --- TicketDetailView (Adapted for Admin) ---
const TicketDetailView = ({ ticket, onClose, onReply, onStatusChange, isProcessing, adminUserId }) => {
    const [replyMessage, setReplyMessage] = useState('');

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (replyMessage.trim()) {
            onReply(ticket.ticketId, replyMessage);
            setReplyMessage('');
        }
    };
    
    if (!ticket) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white shadow-2xl z-20 flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Ticket: {ticket.ticketId}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <FaTimes className="text-gray-600" />
                </button>
            </div>

            <div className="flex-grow p-6 overflow-y-auto no-scrollbar">
                {/* Ticket Info & Status Change */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-600 flex items-center"><FaUser className="mr-2 text-gray-400" /><strong>Buyer:</strong> <span className="ml-1">{ticket.buyer.name} ({ticket.buyer.email})</span></p>
                        <p className="text-gray-600 flex items-center"><FaClipboardList className="mr-2 text-gray-400" /><strong>Category:</strong> <span className="ml-1">{ticket.category}</span></p>
                        {ticket.orderId && <p className="text-gray-600 flex items-center"><FaHashtag className="mr-2 text-gray-400" /><strong>Order ID:</strong> <span className="ml-1">{ticket.orderId}</span></p>}
                        <div className="flex items-center">
                           <strong className="mr-2">Status:</strong>
                           <select
                                value={ticket.status}
                                onChange={(e) => onStatusChange(ticket.ticketId, e.target.value)}
                                className="p-1 border rounded-md text-sm bg-white"
                           >
                               <option value="Open">Open</option>
                               <option value="In Progress">In Progress</option>
                               <option value="Resolved">Resolved</option>
                               <option value="Closed">Closed</option>
                           </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center"><FaFileAlt className="mr-2" /> Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    {ticket.attachment && (
                        <a href={ticket.attachment} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-blue-600 hover:underline text-sm">
                            <FaPaperclip className="mr-1" /> View Attachment
                        </a>
                    )}
                </div>

                {/* Conversation */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                     <h4 className="font-bold text-gray-800 mb-3 flex items-center"><FaCommentDots className="mr-2" /> Conversation</h4>
                     <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar pr-2">
                        {ticket.replies?.length > 0 ? (
                            ticket.replies.map((reply, index) => (
                                <div key={index} className={`flex items-start gap-3 ${reply.userId === adminUserId ? 'justify-end' : ''}`}>
                                    {reply.userId !== adminUserId && <div className="p-2 bg-blue-500 text-white rounded-full"><FaUser/></div>}
                                    <div className={`p-3 rounded-lg max-w-md ${reply.userId === adminUserId ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                                        <p className="font-semibold text-sm text-gray-900">{reply.userName || 'Buyer'}</p>
                                        <p className="text-gray-700 text-sm mt-1">{reply.message}</p>
                                        <p className="text-gray-500 text-xs mt-1 text-right">{new Date(reply.timestamp).toLocaleString()}</p>
                                    </div>
                                    {reply.userId === adminUserId && <div className="p-2 bg-emerald-600 text-white rounded-full"><FaUserTie/></div>}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm">No replies yet.</p>
                        )}
                     </div>
                </div>
            </div>

            {/* Reply Form */}
            <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleReplySubmit}>
                    <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows="3"
                        placeholder="Type your response..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isProcessing}
                    />
                    <button
                        type="submit"
                        disabled={isProcessing || !replyMessage.trim()}
                        className="mt-2 w-full flex items-center justify-center py-2.5 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? <FaSpinner className="animate-spin" /> : <FaReply className="mr-2" />}
                        Send Reply
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

// --- Main Admin Support Dashboard Component ---
export default function SellerSupport() {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = customStyles;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // For demonstration, let's assume the admin's ID is 'admin01'
    const ADMIN_USER_ID = 'admin01';

    const [filters, setFilters] = useState({ search: '', status: 'All', category: 'All' });
    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 10;

    // --- Data Fetching and Management ---
    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setTickets(dummyTicketsData);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = filters.search === '' ||
                ticket.ticketId.toLowerCase().includes(searchLower) ||
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.buyer.email.toLowerCase().includes(searchLower);

            const matchesStatus = filters.status === 'All' || ticket.status === filters.status;
            const matchesCategory = filters.category === 'All' || ticket.category === filters.category;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [tickets, filters]);

    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * ticketsPerPage;
        return filteredTickets.slice(startIndex, startIndex + ticketsPerPage);
    }, [filteredTickets, currentPage, ticketsPerPage]);

    const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };
    
    const handleClearFilters = () => {
        setFilters({ search: '', status: 'All', category: 'All' });
        setCurrentPage(1);
    };

    // --- API-like Handlers ---
    const handleSelectTicket = (ticketId) => {
        const ticket = tickets.find(t => t.ticketId === ticketId);
        setSelectedTicket(ticket);
    };

    const handleCloseDetail = () => {
        setSelectedTicket(null);
    };

    const handleReply = useCallback((ticketId, message) => {
        setIsProcessing(true);
        console.log(`Replying to ${ticketId} with: "${message}"`);
        
        // Simulate API call
        setTimeout(() => {
            const newReply = {
                userId: ADMIN_USER_ID,
                userName: 'Admin Bob', // This would come from the logged-in admin's profile
                message: message,
                timestamp: new Date().toISOString(),
            };
            
            setTickets(prevTickets => prevTickets.map(t => {
                if (t.ticketId === ticketId) {
                    const updatedTicket = {
                        ...t,
                        replies: [...(t.replies || []), newReply],
                        status: 'In Progress', // Automatically change status on reply
                        updatedAt: new Date().toISOString()
                    };
                    setSelectedTicket(updatedTicket); // Update the detail view live
                    return updatedTicket;
                }
                return t;
            }));
            
            setIsProcessing(false);
        }, 500);

    }, [ADMIN_USER_ID]);

    const handleStatusChange = useCallback((ticketId, newStatus) => {
        setIsProcessing(true);
        console.log(`Changing status of ${ticketId} to: ${newStatus}`);
        
        // Simulate API call
        setTimeout(() => {
            setTickets(prevTickets => prevTickets.map(t => {
                if (t.ticketId === ticketId) {
                     const updatedTicket = { ...t, status: newStatus, updatedAt: new Date().toISOString() };
                     setSelectedTicket(updatedTicket); // Update detail view live
                     return updatedTicket;
                }
                return t;
            }));
            setIsProcessing(false);
        }, 300);
    }, []);

    const openTicketsCount = useMemo(() => tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length, [tickets]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
            <header className="bg-white p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaTicketAlt className="mr-3 text-emerald-600" />
                    Seller Support Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                    {openTicketsCount} open tickets out of {tickets.length} total.
                </p>
            </header>

            <main className="flex-grow p-6 flex overflow-hidden">
                <div className="w-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative">
                    {/* Filters */}
                    <div className="p-4 border-b grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Search</label>
                            <div className="relative">
                                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="ID, subject, email..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                                <option>All</option>
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                                <option>Closed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                                <option>All</option>
                                <option>Order Issue</option>
                                <option>Product Query</option>
                                <option>Delivery Issue</option>
                                <option>Payment Issue</option>
                                <option>Technical Support</option>
                                <option>Feedback</option>
                            </select>
                        </div>
                         <button onClick={handleClearFilters} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Clear Filters</button>
                    </div>

                    {/* Table */}
                    <div className="flex-grow overflow-x-auto no-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center p-8"><FaSpinner className="animate-spin text-emerald-500 text-2xl mx-auto"/></td></tr>
                                ) : paginatedTickets.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center p-8 text-gray-500">No tickets found.</td></tr>
                                ) : (
                                    paginatedTickets.map(ticket => (
                                        <tr key={ticket.ticketId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.ticketId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-xs truncate">{ticket.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.buyer.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(ticket.status)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button onClick={() => handleSelectTicket(ticket.ticketId)} className="text-emerald-600 hover:text-emerald-800 font-semibold">View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t flex justify-between items-center">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FaChevronLeft/></button>
                            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FaChevronRight/></button>
                        </div>
                    )}
                    
                    {/* Detail View (Slide-in Panel) */}
                    <AnimatePresence>
                        {selectedTicket && (
                            <TicketDetailView 
                                ticket={selectedTicket}
                                onClose={handleCloseDetail}
                                onReply={handleReply}
                                onStatusChange={handleStatusChange}
                                isProcessing={isProcessing}
                                adminUserId={ADMIN_USER_ID}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}