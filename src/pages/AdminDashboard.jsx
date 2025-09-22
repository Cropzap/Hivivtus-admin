import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Building2,
  Ticket,
  ShieldCheck,
  ShoppingCart,
  Tags,
  XCircle,
  RefreshCcw,
  User,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// Simple Card & CardContent components for a consistent design.
const Card = ({ children, className }) => (
  <motion.div
    className={`rounded-2xl shadow-lg bg-white p-6 transition-all duration-300 transform hover:scale-105 ${className || ""}`}
  >
    {children}
  </motion.div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="flex flex-col items-start">
    <div className={`p-3 rounded-full mb-3 shadow-md`} style={{ backgroundColor: `${color}1A`, color: color }}>
      <Icon className="w-8 h-8" />
    </div>
    <p className="text-gray-500 font-semibold text-sm uppercase">{title}</p>
    <h2 className="text-3xl font-bold mt-1" style={{ color: color }}>{value}</h2>
  </Card>
);

const TabButton = ({ title, active, onClick }) => (
  <button
    className={`px-6 py-3 text-lg font-semibold rounded-t-xl transition-colors duration-200
      ${active
        ? "bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-t-md"
        : "bg-gray-100 text-gray-600 hover:text-indigo-500"
      }`}
    onClick={onClick}
  >
    {title}
  </button>
);

// Constants for styling
const API_BASE_URL = import.meta.env.VITE_API_URL;
const COLORS = ["#4D8BFF", "#2EBE77", "#FFB63D", "#FF6B6B", "#8B6BFF", "#2ECBE7"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}admin/dashboard`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Placeholder data for today's metrics until backend is updated.
        // Replace with actual data once available from the API.
        setStats({
          ...data,
          todayRegisteredCustomers: 15,
          todayRegisteredSellers: 3,
          todayOrders: 7,
        });
        setError(null);
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <RefreshCcw className="animate-spin text-indigo-500" size={48} />
        <span className="ml-4 text-xl font-semibold text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center p-4">
        <XCircle size={48} className="text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        <p className="text-sm text-gray-500 mt-2">
          Please ensure your backend server is running and accessible.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center p-4">
        <XCircle size={48} className="text-gray-500 mb-4" />
        <p className="text-xl font-semibold text-gray-600">No data available.</p>
      </div>
    );
  }

  // Data preparation for charts.
  const pieChartData = [
    { name: "FPOs", value: stats.totalFPOs, color: COLORS[0] },
    { name: "SMEs", value: stats.totalSMEs, color: COLORS[1] },
  ];

  const userChartData = [
    { name: "Total Users", count: stats.totalUsers, color: "#8884d8" },
    { name: "Sellers", count: stats.totalSellers, color: "#82ca9d" },
    { name: "Admins", count: stats.totalAdminUsers, color: "#ffc658" },
    { name: "Buyers", count: stats.totalBuyers, color: "#f78693" },
  ];

  const productActivityData = [
    { name: "Products", count: stats.totalProducts, color: "#4B0082" },
    { name: "Orders", count: stats.totalOrders, color: "#B22222" },
    { name: "Carts", count: stats.totalCarts, color: "#228B22" },
    { name: "Tickets", count: stats.totalBuyerSupportTickets, color: "#FFD700" },
  ];

  // The dailyStatsData is no longer needed for the bar chart.
  // We will now use it to populate the new table.
  const dailyStatsData = [
    { name: "New Customers", value: stats.todayRegisteredCustomers, icon: User, color: "#3B82F6" },
    { name: "New Sellers", value: stats.todayRegisteredSellers, icon: Building2, color: "#F59E0B" },
    { name: "New Orders", value: stats.todayOrders, icon: Package, color: "#14B8A6" },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          Admin Dashboard
        </h1> */}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <TabButton
            title="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            title="Analytics"
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#10B981" /> */}
              <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="#3B82F6" />
              <StatCard title="Total Sellers" value={stats.totalSellers} icon={Building2} color="#F59E0B" />
              <StatCard title="Total FPOs" value={stats.totalFPOs} icon={Building2} color="#06B6D4" />
              <StatCard title="Total SMEs" value={stats.totalSMEs} icon={Building2} color="#EF4444" />
              <StatCard title="Total Admin Users" value={stats.totalAdminUsers} icon={ShieldCheck} color="#8B5CF6" />
              <StatCard title="Total Products" value={stats.totalProducts} icon={ShoppingBag} color="#14B8A6" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon={DollarSign} color="#F97316" />
              <StatCard title="Total Carts" value={stats.totalCarts} icon={ShoppingCart} color="#60A5FA" />
              <StatCard title="Total Categories" value={stats.totalCategories} icon={Tags} color="#C084FC" />
              <StatCard title="Total Support Tickets" value={stats.totalBuyerSupportTickets} icon={Ticket} color="#EAB308" />
            </div>

            {/* Today's Metrics Table */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Daily Overview</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Metric</th>
                      <th className="py-3 px-6 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                    {/* Map through the dailyStatsData to create table rows dynamically */}
                    {dailyStatsData.map((stat, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`p-2 rounded-full mr-3`}
                              style={{ backgroundColor: `${stat.color}1A`, color: stat.color }}
                            >
                              <stat.icon className="w-5 h-5" />
                            </span>
                            <span className="font-semibold text-gray-700">
                              {stat.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-left font-bold text-lg">
                          {stat.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab Content */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Pie Chart: FPO vs SME Breakdown */}
            <Card className="flex flex-col items-center p-8">
              <h2 className="text-xl font-bold text-gray-700 mb-4">FPO vs SME Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart: User Types */}
            <Card className="flex flex-col items-center p-8">
              <h2 className="text-xl font-bold text-gray-700 mb-4">User Type Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {userChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart: Platform Activity */}
            <Card className="flex flex-col items-center p-8 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Platform Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {productActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
