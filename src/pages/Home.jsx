import React from 'react';
import SME from './SME'; // Import the new SME component
import FPO from './FPO';
import Customer from './Customer';
import Order from './Order';

// Main content area component
export default function MainContent({ activeMenuItem }) {
  // Render different components based on the active menu item
  const renderContent = () => {
    switch (activeMenuItem) {
      case 'Home':
        return (
          <div className="p-6 bg-white rounded-2xl shadow-md">
            <h1 className="text-3xl font-bold mb-4">Home Dashboard</h1>
            <p className="text-gray-600">Welcome to the Admin Dashboard!</p>
          </div>
        );
      case 'SME':
        return <SME />;
      case 'FPO':
        return <FPO />;
      case 'Customers':
        return <Customer/>;
      case 'Orders':
        return <Order/>
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
    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
      {renderContent()}
    </main>
  );
}
