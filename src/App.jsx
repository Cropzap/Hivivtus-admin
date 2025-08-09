import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MainContent from './pages/Home';
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
  { name: 'FPO', icon: Building },
  { name: 'SME', icon: BriefcaseBusiness },
  { name: 'Customers', icon: Users },
  { name: 'Orders', icon: Package },
  { name: 'Buyer Support', icon: Headset },
  { name: 'Seller Support', icon: Ticket },
  { name: 'Add Category', icon: List },
  { name: 'Add Admin', icon: UserPlus },
];

export default function App() {
  // State for managing the sidebar visibility (for mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for tracking the active menu item
  const [activeMenuItem, setActiveMenuItem] = useState('Home');
  // State for simulating login status
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Function to simulate user login
  const handleLogin = () => setIsLoggedIn(true);

  // Function to simulate user logout
  const handleLogout = () => setIsLoggedIn(false);

  // Conditional rendering: show login screen if not logged in
  if (!isLoggedIn) {
    return <Login handleLogin={handleLogin} />;
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
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          setIsSidebarOpen={setIsSidebarOpen}
          activeMenuItem={activeMenuItem}
          handleLogout={handleLogout}
        />
        <MainContent activeMenuItem={activeMenuItem} 
        setActiveMenuItem={setActiveMenuItem}/>
      </div>
    </div>
  );
}
