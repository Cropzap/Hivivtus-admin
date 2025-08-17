import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    BriefcaseBusiness,
    Mail,
    Smartphone,
    MapPin,
    FileText,
    CheckCircle2,
    Hourglass,
    XCircle,
    PlusCircle,
    Search,
    Filter,
    Download,
    Eye,
    X,
    RefreshCcw,
} from 'lucide-react';

// You can configure this to your backend server
const API_BASE_URL = 'http://localhost:5000/api';

// --- Helper function to get status styling ---
const getStatusInfo = (status) => {
    switch (status) {
        case 'new':
            return { color: 'bg-blue-100', text: 'text-blue-700', icon: PlusCircle };
        case 'pending':
            return { color: 'bg-yellow-100', text: 'text-yellow-700', icon: Hourglass };
        case 'approved':
            return { color: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 };
        case 'rejected':
            return { color: 'bg-red-100', text: 'text-red-700', icon: XCircle };
        default:
            return { color: 'bg-gray-100', text: 'text-gray-700', icon: null };
    }
};

// --- Custom Confirmation Modal ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4">
                <p className="text-lg font-semibold text-center">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Modal component for displaying full FPO details ---
const FPOModal = ({ fpo, onClose, onUpdateStatus }) => {
    const statusInfo = getStatusInfo(fpo.sellerStatus);
    const StatusIcon = statusInfo.icon;
    const [showConfirm, setShowConfirm] = useState(false);
    const [nextStatus, setNextStatus] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleUpdateClick = (newStatus) => {
        setNextStatus(newStatus);
        setShowConfirm(true);
    };

    const handleConfirmUpdate = () => {
        onUpdateStatus(fpo._id, nextStatus);
        setShowConfirm(false);
    };

    const fileFields = [
        { key: 'userPhoto', label: 'User Photo' },
        { key: 'shopPhoto', label: 'Shop Photo' },
        { key: 'companyRegistrationDoc', label: 'Company Registration' },
        { key: 'gstCertificate', label: 'GST Certificate' },
        { key: 'bankDetailsDoc', label: 'Bank Details' },
        { key: 'idProofDoc', label: 'ID Proof' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 overflow-y-auto">
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 space-y-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4">
                        {fpo.companyName}
                    </h2>

                    {/* Status section */}
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-700">Current Status:</span>
                        <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 ${statusInfo.color} ${statusInfo.text}`}>
                            {StatusIcon && <StatusIcon size={14} />}
                            <span>{fpo.sellerStatus.toUpperCase()}</span>
                        </span>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {['new', 'pending', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleUpdateClick(status)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                                    ${fpo.sellerStatus === status
                                        ? 'bg-gray-300 text-gray-800 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                disabled={fpo.sellerStatus === status}
                            >
                                Set to {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center space-x-2">
                            <BriefcaseBusiness size={16} className="text-gray-500" />
                            <span className="font-semibold">Seller:</span>
                            <span>{fpo.sellerName}</span>
                        </p>
                        <p className="flex items-center space-x-2">
                            <Mail size={16} className="text-gray-500" />
                            <span className="font-semibold">Email:</span>
                            <span>{fpo.email}</span>
                        </p>
                        <p className="flex items-center space-x-2">
                            <Smartphone size={16} className="text-gray-500" />
                            <span className="font-semibold">Mobile:</span>
                            <span>{fpo.mobile}</span>
                        </p>
                        <p className="flex items-center space-x-2">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="font-semibold">Address:</span>
                            <span>{fpo.address.street}, {fpo.address.city}, {fpo.address.state} - {fpo.address.pincode}</span>
                        </p>
                        <p className="col-span-1 sm:col-span-2">
                            <span className="font-semibold">Business Description:</span>
                            <p className="text-gray-600 mt-1">{fpo.businessDescription || 'Not provided'}</p>
                        </p>
                        <p className="flex items-center space-x-2">
                            <span className="font-semibold">Date of Establishment:</span>
                            <span>{formatDate(fpo.dateOfEstablishment)}</span>
                        </p>
                    </div>

                    {/* Documents Section */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-800 border-t pt-4">Documents</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {fileFields.map(field => (
                                <a
                                    key={field.key}
                                    href={fpo[field.key]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-inner transition-colors
                                        ${fpo[field.key]
                                            ? 'bg-gray-100 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={!fpo[field.key]}
                                >
                                    <FileText size={24} className="text-gray-500" />
                                    <span className="mt-2 text-sm text-center font-medium">{field.label}</span>
                                    {!fpo[field.key] && (
                                        <span className="text-xs text-red-500 mt-1">Not Uploaded</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {showConfirm && (
                <ConfirmationModal
                    message={`Are you sure you want to change the status to '${nextStatus}'?`}
                    onConfirm={handleConfirmUpdate}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};


// --- Main FPO Dashboard Component ---
export default function FPO() {
    const [fpos, setFpos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedFPO, setSelectedFPO] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Fetches the FPO data from the backend API.
     * Includes robust error handling.
     */
    const fetchFPOs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            console.log('Token retrieved from localStorage:', token);

            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            // Corrected API endpoint for FPOs
            const response = await fetch(`${API_BASE_URL}/sellerprofile/fpo-admin`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Assuming the backend returns the array of profiles directly.
            setFpos(data || []);
            
        } catch (err) {
            console.error('Error fetching FPO data:', err);
            setError(
                `Failed to retrieve data. This might be due to an expired token, server error, or network issue. Details: ${err.message}`
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Updates an FPO's status via a PUT request to the backend.
     */
    const updateFPOStatus = useCallback(async (fpoId, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token missing. Please log in.');
                setSelectedFPO(null);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/sellerprofile/update-status/${fpoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ sellerStatus: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status.');
            }

            const updatedProfile = await response.json();
            setFpos(currentFpos => currentFpos.map(fpo =>
                fpo._id === updatedProfile.sellerProfile._id ? updatedProfile.sellerProfile : fpo
            ));
            setSelectedFPO(null);
        } catch (err) {
            console.error("Error updating FPO status:", err);
            setError(`Error updating status: ${err.message}`);
            setSelectedFPO(null);
        }
    }, []);

    // UseEffect hook to check authentication status
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setLoading(false); // Stop loading if not authenticated
        }
    }, []);

    // UseEffect hook for initial data fetch, dependent on authentication status
    useEffect(() => {
        if (isAuthenticated) {
            fetchFPOs();
        }
    }, [isAuthenticated, fetchFPOs]);

    // --- Filtering and searching logic using useMemo for performance ---
    const filteredFpos = useMemo(() => {
        let filtered = fpos;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(fpo => fpo.sellerStatus === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(fpo =>
                (fpo.companyName && fpo.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (fpo.sellerName && fpo.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (fpo.email && fpo.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return filtered;
    }, [fpos, searchTerm, filterStatus]);

    const handleDownloadExcel = () => {
        const dataToExport = filteredFpos.map(fpo => ({
            _id: fpo._id,
            companyName: fpo.companyName,
            sellerName: fpo.sellerName,
            email: fpo.email,
            mobile: fpo.mobile,
            sellerStatus: fpo.sellerStatus,
            address: `${fpo.address.street}, ${fpo.address.city}, ${fpo.address.state} - ${fpo.address.pincode}`,
        }));

        const csvRows = [];
        if (dataToExport.length > 0) {
            const headers = Object.keys(dataToExport[0]);
            csvRows.push(headers.join(','));
        }

        for (const row of dataToExport) {
            const values = Object.values(row).map(value => {
                const escaped = ('' + value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'fpo_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <RefreshCcw className="animate-spin text-blue-500" size={48} />
                <span className="ml-4 text-xl font-semibold text-gray-600">Loading FPO data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-4">
                <XCircle size={48} className="text-red-500 mb-4" />
                <p className="text-xl font-semibold text-red-600">{error}</p>
                <button onClick={fetchFPOs} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-4">
                <XCircle size={48} className="text-red-500 mb-4" />
                <p className="text-xl font-semibold text-gray-600">You must be logged in to view this page. Please log in and try again.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">FPO Dashboard</h1>

            {/* Filter, Search, and Export Bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by company, seller, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative w-full sm:w-1/4">
                    <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <button
                    onClick={handleDownloadExcel}
                    className="flex items-center space-x-2 w-full sm:w-auto px-4 py-2 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-colors"
                >
                    <Download size={20} />
                    <span>Export as Excel</span>
                </button>
            </div>

            {/* FPO Table */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seller Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFpos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No matching FPO profiles found.
                                    </td>
                                </tr>
                            ) : (
                                filteredFpos.map((fpo) => {
                                    const statusInfo = getStatusInfo(fpo.sellerStatus);
                                    const StatusIcon = statusInfo.icon;
                                    return (
                                        <tr key={fpo._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fpo.companyName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fpo.sellerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fpo.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fpo.mobile}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color} ${statusInfo.text}`}>
                                                    {fpo.sellerStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedFPO(fpo)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedFPO && (
                <FPOModal
                    fpo={selectedFPO}
                    onClose={() => setSelectedFPO(null)}
                    onUpdateStatus={updateFPOStatus}
                />
            )}
        </div>
    );
}
