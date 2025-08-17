// App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MainContent from './pages/Home'; // Assuming this component now handles view switching
import Login from './pages/Login';
import {
  Home,
  Users,
  Building,
  BriefcaseBusiness,
  Package,
  Headset,
  Ticket,
  List,
  UserPlus,
} from 'lucide-react';

// A simple object to define the navigation menu items and their icons
const menuItems = [
  { name: 'Home', icon: Home },
  { name: 'FPO', icon: Building, roles: ['admin'] },
  { name: 'SME', icon: BriefcaseBusiness, roles: ['admin'] },
  { name: 'Customers', icon: Users, roles: ['admin'] },
  { name: 'Orders', icon: Package, roles: ['admin'] },
  { name: 'Buyer Support', icon: Headset, roles: ['admin'] },
  { name: 'Seller Support', icon: Ticket, roles: ['admin'] },
  { name: 'Add Category', icon: List, roles: ['admin'] },
  { name: 'Add Banner', icon: List, roles: ['admin'] },
  { name: 'Add Admin', icon: UserPlus, roles: ['admin'] },
];

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // New state to store the user's role, crucial for handling permissions
  const [userRole, setUserRole] = useState(null); 
  

  // Use useEffect to check for a token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Here, you would decode the JWT to get the user's role.
        // For now, let's assume a token means an 'admin' role.
        // You'll need to replace this with actual token decoding logic.
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const role = decodedToken.user.role || 'user'; // Assuming a 'role' field in the token payload
        
        setIsLoggedIn(true);
        setUserRole(role);
      } catch (error) {
        console.error("Invalid token found in localStorage:", error);
        localStorage.removeItem('authToken'); // Clear invalid token
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }
  }, []); // The empty dependency array ensures this runs only once on mount

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserRole(null);
  };
  
  // Conditional rendering: show login screen if not logged in
  if (!isLoggedIn) {
    // Pass the setIsLoggedIn function directly to the Login component
    // The Login component will call setIsLoggedIn(true) on successful login
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  // Render the full dashboard if logged in
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        menuItems={menuItems}
        userRole={userRole} // Pass the user's role to the Sidebar for conditional menu items
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenuItem={activeMenuItem}
          handleLogout={handleLogout}
        />
        <MainContent 
          activeMenuItem={activeMenuItem} 
          setActiveMenuItem={setActiveMenuItem}
          userRole={userRole} // Pass the user's role to MainContent
        />
      </div>
    </div>
  );
}
