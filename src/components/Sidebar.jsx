import React from 'react';
import { ChevronLeft } from 'lucide-react';

// Sidebar component for navigation
export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeMenuItem, setActiveMenuItem, menuItems }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
        <h1 className="text-2xl font-bold">Hivictus Admin Console</h1>
        {/* Close button for mobile view */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden text-white"
          aria-label="Close sidebar"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Navigation list */}
      <nav className="p-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => {
                  setActiveMenuItem(item.name);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                  activeMenuItem === item.name
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'hover:bg-gray-200'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
