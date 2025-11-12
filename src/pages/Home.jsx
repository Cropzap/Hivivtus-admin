import React from 'react';
import SME from './SME';
import FPO from './FPO';
import Customer from './Customer';
import Order from './Order';
import BuyerSupport from './BuyerSupport';
import SellerSupportTicket from './SellerSupport';
import AdminDashboard from './AdminDashboard';
import App from './AddCategory';
import AdminBanner from './AdminBanner';
import AdminProductReview from './AdminProductReview';

// Main content area component
// Accept authToken, userRole, and onAuthError as props
export default function MainContent({ activeMenuItem, setActiveMenuItem, userRole, authToken, onAuthError }) {
  // Render different components based on the active menu item
  const renderContent = () => {
    switch (activeMenuItem) {
      case 'Home':
        // Pass authToken and onAuthError to the AdminDashboard component
        return <AdminDashboard setActiveMenuItem={setActiveMenuItem} authToken={authToken} onAuthError={onAuthError} />;
      case 'SME':
        // Pass authToken and userRole to the SME component
        return <SME userRole={userRole} authToken={authToken} />;
      case 'FPO':
        // Pass authToken and userRole to the FPO component
        return <FPO userRole={userRole} authToken={authToken} />;
      case 'Customers':
        // Pass authToken and userRole to the Customer component
        return <Customer userRole={userRole} authToken={authToken} />;
        case 'Add Category':
        // Pass authToken and userRole to the Customer component
        return <App userRole={userRole} authToken={authToken} />;
      
      case 'Products':
        // Pass authToken and userRole to the Customer component
        return <AdminProductReview userRole={userRole} authToken={authToken} />;
      case 'Orders':
        // Pass authToken and userRole to the Order component
        return <Order userRole={userRole} authToken={authToken} />;
      case 'Buyer Support':
        // Pass authToken and userRole to the BuyerSupport component
        return <BuyerSupport userRole={userRole} authToken={authToken} />;
      case 'Seller Support':
        // Pass authToken and userRole to the SellerSupportTicket component
        return <SellerSupportTicket userRole={userRole} authToken={authToken} />;
      case 'Add Banner':
        return <AdminBanner  userRole={userRole} authToken={authToken}/>;
      // Add more cases for other menu items here
      default:
        return (
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-3xl font-bold mb-4">{activeMenuItem}</h1>
            <p className="text-gray-600">Content for the {activeMenuItem} section goes here.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-1  md:p-8 overflow-y-auto">
      {renderContent()}
    </main>
  );
}
