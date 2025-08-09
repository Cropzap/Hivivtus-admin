import React from 'react';
import { Menu, Search, Bell, LogOut } from 'lucide-react';

// Topbar component with search, notifications, and logout
export default function Topbar({ setIsSidebarOpen, activeMenuItem, handleLogout }) {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-md p-4 flex items-center justify-between h-16">
      {/* Hamburger menu for mobile */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden text-gray-600"
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Search bar and title for larger screens */}
      <div className="hidden lg:flex items-center">
        <h2 className="text-2xl font-bold text-gray-900">{activeMenuItem} Dashboard</h2>
      </div>

      {/* Right side of the top bar */}
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
