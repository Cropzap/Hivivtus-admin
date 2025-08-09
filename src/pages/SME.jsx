import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

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

// --- Modal component for displaying full SME details ---
const SMEModal = ({ sme, onClose }) => {
  const statusInfo = getStatusInfo(sme.sellerStatus);
  const StatusIcon = statusInfo.icon;

  const handleViewDocument = (docName) => {
    // In a real application, you would implement logic here to open a PDF viewer or download the file.
    // For this example, we'll use a simple alert replacement.
    window.alert(`Simulating viewing document: ${docName}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 border-b pb-4">
          {sme.companyName}
        </h2>
        
        {/* Status section */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 ${statusInfo.color} ${statusInfo.text}`}>
            {StatusIcon && <StatusIcon size={14} />}
            <span>{sme.sellerStatus.toUpperCase()}</span>
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p className="flex items-center space-x-2">
            <BriefcaseBusiness size={16} className="text-gray-500" />
            <span className="font-semibold">Seller:</span>
            <span>{sme.sellerName}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Mail size={16} className="text-gray-500" />
            <span className="font-semibold">Email:</span>
            <span>{sme.email}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Smartphone size={16} className="text-gray-500" />
            <span className="font-semibold">Mobile:</span>
            <span>{sme.mobile}</span>
          </p>
          <p className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="font-semibold">Address:</span>
            <span>{sme.address.street}, {sme.address.city}, {sme.address.state} - {sme.address.pincode}</span>
          </p>
          <p className="col-span-1 sm:col-span-2">
            <span className="font-semibold">Business Description:</span>
            <p className="text-gray-600 mt-1">{sme.businessDescription || 'Not provided'}</p>
          </p>
          <p className="flex items-center space-x-2">
            <span className="font-semibold">Date of Establishment:</span>
            <span>{formatDate(sme.dateOfEstablishment)}</span>
          </p>
        </div>

        {/* Documents Section */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800 border-t pt-4">Documents</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.keys(sme).filter(key => key.includes('Doc') || key.includes('Photo')).map(docKey => (
              <button
                key={docKey}
                onClick={() => handleViewDocument(docKey)}
                className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl shadow-inner hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!sme[docKey]}
              >
                <FileText size={24} className="text-gray-500" />
                <span className="mt-2 text-sm text-center">{docKey.replace(/([A-Z])/g, ' $1').trim()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main SME Dashboard Component ---
export default function SME() {
  const initialSMEs = [
    {
      "_id": { "$oid": "68936d82b0c04bffbb47e038" },
      "email": "k@gmail.com",
      "companyName": "Cropzap",
      "sellerName": "Kavin",
      "mobile": "7598287008",
      "alternateMobile": null,
      "dateOfEstablishment": null,
      "businessDescription": "",
      "address": { "street": "test", "city": "test", "state": "test", "pincode": "744563" },
      "businessType": "SME",
      "sellerStatus": "new",
      "userPhoto": null,
      "shopPhoto": null,
      "companyRegistrationDoc": null,
      "gstCertificate": null,
      "bankDetailsDoc": null,
      "idProofDoc": null,
      "createdAt": { "$date": "2025-08-06T14:58:10.660Z" },
      "updatedAt": { "$date": "2025-08-06T14:58:10.662Z" },
      "__v": 0
    },
    {
      "_id": { "$oid": "68936e93b0c04bffbb47e045" },
      "email": "sarah.jones@example.com",
      "companyName": "Green Harvest Co.",
      "sellerName": "Sarah Jones",
      "mobile": "9876543210",
      "alternateMobile": null,
      "dateOfEstablishment": "2023-01-15",
      "businessDescription": "Specializing in organic produce and local goods.",
      "address": { "street": "456 Oak Ave", "city": "Springfield", "state": "IL", "pincode": "62704" },
      "businessType": "SME",
      "sellerStatus": "pending",
      "userPhoto": null,
      "shopPhoto": null,
      "companyRegistrationDoc": "green_harvest_co.pdf", // dummy data to show view button
      "gstCertificate": "gst-cert-ghc.pdf",
      "bankDetailsDoc": "bank-details-ghc.pdf",
      "idProofDoc": "sarah_jones_id.pdf",
      "createdAt": { "$date": "2025-08-01T10:00:00.000Z" },
      "updatedAt": { "$date": "2025-08-02T11:30:00.000Z" },
      "__v": 0
    },
    {
      "_id": { "$oid": "68936d82b0c04bffbb47e039" },
      "email": "john.doe@example.com",
      "companyName": "AgriTech Solutions",
      "sellerName": "John Doe",
      "mobile": "9998887776",
      "alternateMobile": "9998887777",
      "dateOfEstablishment": "2020-05-20",
      "businessDescription": "Providing technological solutions for modern agriculture.",
      "address": { "street": "101 Tech Park", "city": "Bangalore", "state": "Karnataka", "pincode": "560001" },
      "businessType": "SME",
      "sellerStatus": "approved",
      "userPhoto": null,
      "shopPhoto": null,
      "companyRegistrationDoc": "agritech_reg.pdf",
      "gstCertificate": "agritech_gst.pdf",
      "bankDetailsDoc": null,
      "idProofDoc": "john_doe_id.pdf",
      "createdAt": { "$date": "2025-07-15T10:00:00.000Z" },
      "updatedAt": { "$date": "2025-07-20T11:30:00.000Z" },
      "__v": 0
    },
    {
      "_id": { "$oid": "68936d82b0c04bffbb47e040" },
      "email": "jane.smith@example.com",
      "companyName": "Organic Foods Inc.",
      "sellerName": "Jane Smith",
      "mobile": "8887776665",
      "alternateMobile": null,
      "dateOfEstablishment": "2022-11-10",
      "businessDescription": "Supplier of certified organic food products to retailers.",
      "address": { "street": "200 Green Lane", "city": "Pune", "state": "Maharashtra", "pincode": "411001" },
      "businessType": "SME",
      "sellerStatus": "rejected",
      "userPhoto": null,
      "shopPhoto": null,
      "companyRegistrationDoc": "organic_foods_reg.pdf",
      "gstCertificate": null,
      "bankDetailsDoc": "organic_foods_bank.pdf",
      "idProofDoc": "jane_smith_id.pdf",
      "createdAt": { "$date": "2025-06-01T14:00:00.000Z" },
      "updatedAt": { "$date": "2025-06-05T15:00:00.000Z" },
      "__v": 0
    }
  ];

  const [smes, setSmes] = useState(initialSMEs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSME, setSelectedSME] = useState(null);

  // --- Functions for data management ---
  const handleStatusChange = (smeId, newStatus) => {
    setSmes(
      smes.map((sme) =>
        sme._id.$oid === smeId ? { ...sme, sellerStatus: newStatus } : sme
      )
    );
  };

  const handleDownloadExcel = () => {
    const dataToExport = filteredSmes.map(sme => ({
      _id: sme._id.$oid,
      companyName: sme.companyName,
      sellerName: sme.sellerName,
      email: sme.email,
      mobile: sme.mobile,
      sellerStatus: sme.sellerStatus,
      address: `${sme.address.street}, ${sme.address.city}, ${sme.address.state} - ${sme.address.pincode}`,
      // Add other fields you want to export
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
    link.download = 'sme_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtering and searching logic ---
  const filteredSmes = useMemo(() => {
    let filtered = smes;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(sme => sme.sellerStatus === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(sme =>
        sme.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sme.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [smes, searchTerm, filterStatus]);


  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">SME Dashboard</h1>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search by company or seller name..."
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
          className="w-full sm:w-1/4 flex items-center justify-center space-x-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-green-600 transition-colors"
        >
          <Download size={20} />
          <span>Download Excel</span>
        </button>
      </div>

      {/* Main SME List/Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <div className="hidden lg:grid grid-cols-6 gap-4 p-4 font-bold text-gray-600 border-b-2">
          <div className="col-span-2">Company Name</div>
          <div>Seller Name</div>
          <div>Email</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredSmes.length > 0 ? (
          filteredSmes.map((sme) => {
            const statusInfo = getStatusInfo(sme.sellerStatus);
            const StatusIcon = statusInfo.icon;
            return (
              <div
                key={sme._id.$oid}
                className="grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* Mobile view */}
                <div className="lg:hidden space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">{sme.companyName}</h3>
                  <div className="flex items-center text-sm">
                    <BriefcaseBusiness size={16} className="mr-2 text-gray-500" />
                    <span>{sme.sellerName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="mr-2 text-gray-500" />
                    <span>{sme.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 ${statusInfo.color} ${statusInfo.text}`}>
                      {StatusIcon && <StatusIcon size={14} />}
                      <span>{sme.sellerStatus.toUpperCase()}</span>
                    </span>
                    <button
                      onClick={() => setSelectedSME(sme)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </div>
                  <select
                    value={sme.sellerStatus}
                    onChange={(e) => handleStatusChange(sme._id.$oid, e.target.value)}
                    className="mt-2 w-full p-2 border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                {/* Desktop view */}
                <div className="hidden lg:col-span-2 lg:flex lg:items-center text-sm font-semibold">{sme.companyName}</div>
                <div className="hidden lg:flex lg:items-center text-sm text-gray-700">{sme.sellerName}</div>
                <div className="hidden lg:flex lg:items-center text-sm text-gray-700">{sme.email}</div>
                <div className="hidden lg:flex lg:items-center text-sm">
                  <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 ${statusInfo.color} ${statusInfo.text}`}>
                    {StatusIcon && <StatusIcon size={14} />}
                    <span>{sme.sellerStatus.toUpperCase()}</span>
                  </span>
                </div>
                <div className="hidden lg:flex lg:items-center lg:space-x-2">
                  <select
                    value={sme.sellerStatus}
                    onChange={(e) => handleStatusChange(sme._id.$oid, e.target.value)}
                    className="p-2 border border-gray-300 rounded-xl text-sm"
                  >
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => setSelectedSME(sme)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No SME users found with the current filters.
          </div>
        )}
      </div>

      {/* Conditional rendering of the modal */}
      {selectedSME && <SMEModal sme={selectedSME} onClose={() => setSelectedSME(null)} />}
    </div>
  );
}
