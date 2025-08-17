import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Trash2,
  Mail,
  Smartphone,
  Download,
  User,
  X,
  Eye,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';

// --- Confirmation Modal Component ---
const ConfirmationModal = ({ message, onConfirm, onCancel, isProcessing }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800">Confirm Action</h3>
      <p className="text-gray-600">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin mx-4" />
          ) : (
            'Confirm'
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- View Details Modal Component ---
const CustomerDetailsModal = ({ customer, onClose }) => {
  if (!customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAddressString = (address) => {
    if (!address) return 'N/A';
    const { street, city, state, zip, country } = address;
    const parts = [street, city, state, zip, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 space-y-6 animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4">Customer Details</h3>

        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <img 
              src={customer.profilePicture || "https://placehold.co/100x100/E0E0E0/333333?text=User"} 
              alt={customer.name}
              className="w-32 h-32 rounded-full object-cover shadow-lg"
            />
          </div>

          {/* Core Details */}
          <div className="flex-1 space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
              <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><User size={20} className="mr-2 text-blue-500" /> Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-semibold text-gray-900">{customer.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Date of Birth</p>
                  <p className="font-semibold text-gray-900">{formatDate(customer.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Gender</p>
                  <p className="font-semibold text-gray-900">{customer.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Member Since</p>
                  <p className="font-semibold text-gray-900">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
              <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><Briefcase size={20} className="mr-2 text-green-500" /> Professional Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Occupation</p>
                  <p className="font-semibold text-gray-900">{customer.occupation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Company</p>
                  <p className="font-semibold text-gray-900">{customer.company || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><Smartphone size={20} className="mr-2 text-indigo-500" /> Contact Info</h4>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-semibold text-gray-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Primary Mobile</p>
                <p className="font-semibold text-gray-900">{customer.mobile}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Alternate Mobile</p>
                <p className="font-semibold text-gray-900">{customer.alternatePhone || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Address Details */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 flex items-center mb-2"><MapPin size={20} className="mr-2 text-red-500" /> Address</h4>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">{getAddressString(customer.address)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Customer Component ---
export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to fetch customers from the backend
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');

      // Add this console.log to see the exact token being used
      console.log('Token retrieved from localStorage:', token);

      // A more robust check to ensure the token is not null or an empty string
      if (!token || token.trim() === '') {
        setError('Authorization token not found. Please log in again.');
        setLoading(false);
        return; // Exit the function early if no valid token is found
      }

      const response = await fetch('http://localhost:5000/api/customers', {
        headers: {
          'x-auth-token': token
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Invalid or expired token.');
        }
        throw new Error('Failed to fetch customers. Server responded with an error.');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []); // The empty dependency array means this runs only once on mount

  // --- Filtering logic with useMemo for performance ---
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        (customer.name && customer.name.toLowerCase().includes(lowercasedTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(lowercasedTerm)) ||
        (customer.mobile && customer.mobile.includes(lowercasedTerm))
    );
  }, [customers, searchTerm]);

  // --- Grouping logic with useMemo ---
  const groupedCustomers = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Customers': filteredCustomers };
    }
    return filteredCustomers.reduce((acc, customer) => {
      const groupKey = customer[groupBy] || 'Unassigned';
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(customer);
      return acc;
    }, {});
  }, [filteredCustomers, groupBy]);

  const handleToggleGroup = (groupKey) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // --- Functions to handle actions ---
  const handleDeleteClick = (customerId) => {
    setCustomerToDelete(customerId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      // Changed the header name to match your backend's auth middleware
      const response = await fetch(`http://localhost:5000/api/customers/${customerToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer.');
      }

      // Filter out the deleted customer from the local state
      setCustomers(customers.filter((customer) => customer._id !== customerToDelete));
      
      // Close the modal and reset state
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      // Optionally show a user-friendly error message
      alert('Error deleting customer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleViewClick = (customer) => {
    setCustomerToView(customer);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setCustomerToView(null);
  };

  const handleDownloadExcel = () => {
    const dataToExport = filteredCustomers.map(customer => ({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      occupation: customer.occupation || 'N/A',
      company: customer.company || 'N/A',
      createdAt: new Date(customer.createdAt).toLocaleDateString(),
    }));

    const csvRows = [];
    // Get headers
    const headers = Object.keys(dataToExport[0]);
    csvRows.push(headers.join(','));

    // Get data rows
    for (const row of dataToExport) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customer_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render logic based on state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="ml-4 text-xl font-semibold text-gray-700">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 text-center">{error}</p>
        <button
          onClick={fetchCustomers}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 md:p-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Customer Dashboard</h1>
        <p className="text-gray-500 text-lg mb-6">Manage and view customer records.</p>
      </div>

      <div className="max-w-full mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8">
        {/* Filter and Action Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
          <div className="relative w-full lg:w-1/2">
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-gray-600 font-semibold text-sm">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full sm:w-auto p-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="none">None</option>
                <option value="occupation">Occupation</option>
                <option value="company">Company</option>
                <option value="gender">Gender</option>
              </select>
            </div>
            
            <button
              onClick={handleDownloadExcel}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <Download size={20} />
              <span>Download Excel</span>
            </button>
          </div>
        </div>

        {/* Customer List Section */}
        {Object.keys(groupedCustomers).length > 0 ? (
          Object.keys(groupedCustomers).map((groupKey) => (
            <div key={groupKey} className="mb-8">
              <div
                onClick={() => handleToggleGroup(groupKey)}
                className="flex items-center justify-between p-4 bg-gray-200 hover:bg-gray-300 transition-colors rounded-xl cursor-pointer shadow-sm mb-4"
              >
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  {collapsedGroups[groupKey] ? <ChevronRight size={20} className="mr-2" /> : <ChevronDown size={20} className="mr-2" />}
                  {groupKey} ({groupedCustomers[groupKey].length})
                </h2>
              </div>
              {!collapsedGroups[groupKey] && (
                <div className="space-y-4">
                  {groupedCustomers[groupKey].map((customer) => (
                    <div
                      key={customer._id}
                      className="bg-gray-50 rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center space-x-4 w-full md:w-auto">
                        <img 
                          src={customer.profilePicture || "https://placehold.co/100x100/E0E0E0/333333?text=User"} 
                          alt={customer.name} 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{customer.name}</h3>
                          <div className="text-gray-500 text-sm flex items-center space-x-1 truncate">
                            <Mail size={14} />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Building size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">{customer.company || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">{customer.occupation || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => handleViewClick(customer)}
                          className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(customer._id)}
                          className="flex items-center justify-center space-x-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-700 transition-colors shadow-md"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 rounded-2xl border-2 border-dashed border-gray-300">
            No customers found with the current search.
          </div>
        )}
      </div>

      {/* Conditional rendering of the modals */}
      {showDeleteModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this customer record? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isProcessing={isDeleting}
        />
      )}
      {showViewModal && <CustomerDetailsModal customer={customerToView} onClose={handleCloseViewModal} />}
    </div>
  );
}
