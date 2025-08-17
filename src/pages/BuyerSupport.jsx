/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Inline SVG Icons (Replacements for react-icons/fa) ---
// This makes the component fully self-contained without external icon libraries.
const FaTicketAlt = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
    <path d="M542.4 31.9c14.7-18.7 12.8-45.7-4.1-60.4s-45.7-12.8-60.4 4.1L25.6 376.5c-16.7 17.9-19.1 45.4-6.4 65.4l24.4 41.5 131.9-25.1c25.4-4.8 49.3-15.1 69.6-30.8l49.3-37c22.8-17.1 29.8-49.4 15.6-76.3l-13.7-25.1c-14.2-26.9-1.2-59.2 21.6-76.3l49.3-37c20.3-15.6 44.2-25.9 69.6-30.8L534 89.6c17.9-16.7 45.4-19.1 65.4-6.4l24.4 41.5c14.7-18.7 12.8-45.7-4.1-60.4s-45.7-12.8-60.4 4.1L542.4 31.9zM62.6 417.8c-10.9-11.6-28.7-13.1-41.6-3.8L2.4 430.2c-12.2 9.1-13.4 26.5-2.8 38.6l24.4 41.5c10.6 12.1 27.9 13.4 40.2 4.3L62.6 417.8z"/>
  </svg>
);
const FaSearch = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M416 208c0 45.9-14.9 88.3-40.8 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376.8C296.3 402.7 253.9 416 208 416c-114.9 0-208-93.1-208-208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
  </svg>
);
const FaSpinner = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48s21.49-48 48-48s48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zm208-160c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48s48-21.49 48-48zm320-96c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM96 160c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM416 416c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48zM160 416c-26.51 0-48 21.49-48 48s21.49 48 48 48s48-21.49 48-48s-21.49-48-48-48z"/>
  </svg>
);
const FaHourglassHalf = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
    <path d="M368 471.9c0 22.1-17.9 40.1-40 40.1H56c-22.1 0-40-18-40-40.1V424c0-22.1 17.9-40 40-40h272c22.1 0 40 17.9 40 40v47.9zM0 64C0 28.7 28.7 0 64 0h256c35.3 0 64 28.7 64 64v320H0V64zm320 160c0 44.1-35.9 80-80 80s-80-35.9-80-80h-32c0 61.9 50.1 112 112 112s112-50.1 112-112H320zm-112-128c-44.1 0-80 35.9-80 80h-32c0-61.9 50.1-112 112-112s112 50.1 112 112h-32c0-44.1-35.9-80-80-80z"/>
  </svg>
);
const FaCheckCircle = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM227.3 353.7l-114.2-114.2c-4.4-4.4-4.4-11.5 0-15.9l16.1-16.1c4.4-4.4 11.6-4.4 16.1 0l82.7 82.7 197.3-197.3c4.4-4.4 11.5-4.4 15.9 0l16.1 16.1c4.4 4.4 4.4 11.6 0 16.1L243.4 353.7c-4.4 4.4-11.6 4.4-16.1 0z"/>
  </svg>
);
const FaTimes = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor">
    <path d="M310.6 361.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 301.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L114.7 256 9.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 209.3l105.4-105.3c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L205.3 256l105.3 105.4z"/>
  </svg>
);
const FaCommentDots = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M416 344V32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v320c0 17.67 14.33 32 32 32h32v96l129.5-96H384c17.67 0 32-14.33 32-32zM219.2 181.7c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3zm121.2-121.2c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3zm-11.2-11.2c-17.5 10.1-23.3 32.2-13.2 49.7s32.2 23.3 49.7 13.2l56-32.3c17.5-10.1 23.3-32.2 13.2-49.7s-32.2-23.3-49.7-13.2l-56 32.3z"/>
  </svg>
);
const FaUser = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 200.7c31.1-2.9 61-12.1 86.8-25.2 21-10.6 40.5-24.9 57.7-41.1 40.7-39.2 64.9-92.4 71.9-148.9-63.5-35.2-137.9-54.6-215.1-54.6-77.2 0-151.6 19.4-215.1 54.6 7 56.5 31.2 109.7 71.9 148.9 17.2 16.2 36.6 30.5 57.7 41.1 25.8 13.1 55.7 22.3 86.8 25.2z"/>
  </svg>
);
const FaClipboardList = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
    <path d="M336 64h-88c-4.4-18.7-13.6-35.5-27.1-49.8C206.8 6.5 186.2-2.1 160 0c-26.2 2.1-46.8 10.7-60.9 29.5-13.5 14.3-22.7 31.1-27.1 49.8H48c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-160 40c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm128 0c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm-160 96c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48zm128 0c8.8 0 16 7.2 16 16v16c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16v-16c0-8.8 7.2-16 16-16h48z"/>
  </svg>
);
const FaHashtag = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M440.6 132.8L339.7 13.1C333.6 5.7 325.2 0 316.6 0H131.4c-9.5 0-17.9 5.7-24 13.1L24.8 132.8c-6.1 7.4-9.3 16.9-9.3 26.8v319.4c0 9.9 3.2 19.4 9.3 26.8l100.9 119.7c6.1 7.4 14.5 13.1 24 13.1h185.2c9.5 0 17.9-5.7 24-13.1l100.9-119.7c6.1-7.4 9.3-16.9 9.3-26.8V159.6c0-9.9-3.2-19.4-9.3-26.8zM304 464c0 8.8-7.2 16-16 16H160c-8.8 0-16-7.2-16-16V160c0-8.8 7.2-16 16-16h128c8.8 0 16 7.2 16 16v304z"/>
  </svg>
);
const FaFileAlt = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
    <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-144L248 0v136h136l-120-144z"/>
  </svg>
);
const FaPaperclip = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M416 336H240c-26.5 0-48-21.5-48-48V168c0-26.5 21.5-48 48-48h80c26.5 0 48 21.5 48 48v120c0 17.7-14.3 32-32 32s-32-14.3-32-32V168c0-8.8-7.2-16-16-16s-16 7.2-16 16v120c0 17.7-14.3 32-32 32s-32-14.3-32-32V168c0-8.8-7.2-16-16-16s-16 7.2-16 16v120c0 26.5 21.5 48 48 48h80c26.5 0 48-21.5 48-48V168c0-8.8-7.2-16-16-16s-16 7.2-16 16V336z"/>
  </svg>
);
const FaReply = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M416 160C416 71.63 344.4 0 256 0c-78.47 0-142 56.63-157.9 130.5-22.14 10.23-44.53 19.8-66.21 28.5-13.84 5.4-23.86 19.3-24.13 35.1-.26 15.8 8.87 30.6 22.84 37.1l19.45 9.1c5.22 2.4 11.2 3.6 17.1 3.6h256c88.37 0 160-71.63 160-160zM224 208v-40H80c-8.84 0-16 7.16-16 16s7.16 16 16 16h144z"/>
  </svg>
);
const FaChevronLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor">
    <path d="M34.9 289.5l140.6 140.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L127.3 256 220.8 162.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L34.9 211.5c-12.5 12.5-12.5 32.8 0 45.3z"/>
  </svg>
);
const FaChevronRight = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor">
    <path d="M285.1 211.5L144.5 70.9c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L192.7 256 99.2 349.9c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L285.1 289.5c12.5-12.5 12.5-32.8 0-45.3z"/>
  </svg>
);
const FaUserTie = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
    <path d="M416 160c-17.67 0-32-14.33-32-32 0-17.67 14.33-32 32-32s32 14.33 32 32-14.33 32-32 32zm0-64c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zm-144 0c-17.67 0-32-14.33-32-32 0-17.67 14.33-32 32-32s32 14.33 32 32-14.33 32-32 32zm0-64c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zM288 384c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm-45.7 200.7c31.1-2.9 61-12.1 86.8-25.2 21-10.6 40.5-24.9 57.7-41.1 40.7-39.2 64.9-92.4 71.9-148.9-63.5-35.2-137.9-54.6-215.1-54.6-77.2 0-151.6 19.4-215.1 54.6 7 56.5 31.2 109.7 71.9 148.9 17.2 16.2 36.6 30.5 57.7 41.1 25.8 13.1 55.7 22.3 86.8 25.2z"/>
  </svg>
);


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
    case 'Open':
      colorClass = 'bg-blue-100 text-blue-800';
      icon = <FaHourglassHalf className="h-3 w-3" />;
      break;
    case 'In Progress':
      colorClass = 'bg-yellow-100 text-yellow-800';
      icon = <FaSpinner className="h-3 w-3 animate-spin" />;
      break;
    case 'Resolved':
      colorClass = 'bg-emerald-100 text-emerald-800';
      icon = <FaCheckCircle className="h-3 w-3" />;
      break;
    case 'Closed':
      colorClass = 'bg-gray-200 text-gray-800';
      icon = <FaTimes className="h-3 w-3" />;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-700';
      icon = <FaCommentDots className="h-3 w-3" />;
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
          <FaTimes className="text-gray-600 h-5 w-5" />
        </button>
      </div>

      <div className="flex-grow p-6 overflow-y-auto no-scrollbar">
        {/* Ticket Info & Status Change */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p className="text-gray-600 flex items-center"><FaUser className="mr-2 text-gray-400 h-4 w-4" /><strong>Buyer:</strong> <span className="ml-1">{ticket.buyer.name} ({ticket.buyer.email})</span></p>
            <p className="text-gray-600 flex items-center"><FaClipboardList className="mr-2 text-gray-400 h-4 w-4" /><strong>Category:</strong> <span className="ml-1">{ticket.category}</span></p>
            {ticket.orderId && <p className="text-gray-600 flex items-center"><FaHashtag className="mr-2 text-gray-400 h-4 w-4" /><strong>Order ID:</strong> <span className="ml-1">{ticket.orderId}</span></p>}
            <div className="flex items-center">
              <strong className="mr-2">Status:</strong>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.ticketId, e.target.value)}
                className="p-1 border rounded-md text-sm bg-white"
                disabled={isProcessing}
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
          <h4 className="font-bold text-gray-800 mb-2 flex items-center"><FaFileAlt className="mr-2 h-4 w-4" /> Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          {ticket.attachment && (
            <a href={ticket.attachment} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-blue-600 hover:underline text-sm">
              <FaPaperclip className="mr-1 h-4 w-4" /> View Attachment
            </a>
          )}
        </div>

        {/* Conversation */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center"><FaCommentDots className="mr-2 h-4 w-4" /> Conversation</h4>
          <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar pr-2">
            {ticket.replies?.length > 0 ? (
              ticket.replies.map((reply, index) => (
                <div key={index} className={`flex items-start gap-3 ${reply.senderId === adminUserId ? 'justify-end' : ''}`}>
                  {reply.senderId !== adminUserId && <div className="p-2 bg-blue-500 text-white rounded-full"><FaUser className="h-4 w-4" /></div>}
                  <div className={`p-3 rounded-lg max-w-md ${reply.senderId === adminUserId ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                    <p className="font-semibold text-sm text-gray-900">{reply.senderId === adminUserId ? 'Admin' : 'Buyer'}</p>
                    <p className="text-gray-700 text-sm mt-1">{reply.message}</p>
                    <p className="text-gray-500 text-xs mt-1 text-right">{new Date(reply.timestamp).toLocaleString()}</p>
                  </div>
                  {reply.senderId === adminUserId && <div className="p-2 bg-emerald-600 text-white rounded-full"><FaUserTie className="h-4 w-4" /></div>}
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
            {isProcessing ? <FaSpinner className="h-5 w-5 mr-2 animate-spin" /> : <FaReply className="h-5 w-5 mr-2" />}
            Send Reply
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// --- Main Admin Support Dashboard Component ---
export default function BuyerSupport() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = customStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // For demonstration, we'll use a hardcoded admin ID. In a real app, this would come from the auth context.
  const ADMIN_USER_ID = 'admin01';

  const [filters, setFilters] = useState({ search: '', status: 'All', category: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  // --- Data Fetching and Management ---
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/support-tickets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Unauthorized access. Please log in.");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tickets.");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error.message);
      // In a real app, you might use a toast library instead of alert
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  // --- API Handlers ---
  const handleSelectTicket = (ticketId) => {
    const ticket = tickets.find(t => t.ticketId === ticketId);
    setSelectedTicket(ticket);
  };

  const handleCloseDetail = () => {
    setSelectedTicket(null);
  };

  const handleReply = useCallback(async (ticketId, replyMessage) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/support-tickets/${ticketId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reply.");
      }

      const newReply = await response.json();

      // Update the state with the new reply
      setTickets(prevTickets =>
        prevTickets.map(ticket => {
          if (ticket.ticketId === ticketId) {
            // Append the new reply to the existing replies array
            const updatedReplies = [...(ticket.replies || []), newReply];
            const updatedTicket = { ...ticket, replies: updatedReplies, updatedAt: new Date().toISOString() };
            setSelectedTicket(updatedTicket); // Update the detail view
            return updatedTicket;
          }
          return ticket;
        })
      );
    } catch (error) {
      console.error("Error sending reply:", error);
      console.error("Failed to send reply. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // The backend returns the full updated ticket object
      const updatedTicket = await response.json();

      // Update local state with the new ticket data
      setTickets(prevTickets => prevTickets.map(t => {
        if (t.ticketId === ticketId) {
          setSelectedTicket(updatedTicket); // Update detail view live
          return updatedTicket;
        }
        return t;
      }));
    } catch (error) {
      console.error("Error updating status:", error);
      // Display error to user
      console.error("Failed to update status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const openTicketsCount = useMemo(() => tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length, [tickets]);

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col">
      <style>{customStyles}</style>
      <header className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaTicketAlt className="mr-3 text-emerald-600 h-6 w-6" />
          Buyer Support Dashboard
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
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center p-8"><FaSpinner className="h-8 w-8 animate-spin text-emerald-500 mx-auto"/></td></tr>
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
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FaChevronLeft className="h-4 w-4"/></button>
              <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FaChevronRight className="h-4 w-4"/></button>
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
