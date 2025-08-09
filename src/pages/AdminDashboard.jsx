import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Reusable Stat Card Component (Minimalist design, but now clickable) ---
const StatCard = ({ title, value, loading, onClick }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-9 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-4xl font-bold text-gray-800 mt-2">{value.toLocaleString()}</p>
    </button>
  );
};

// --- Reusable Chart Container (Matches the blue-top-border design) ---
const ChartContainer = ({ title, loading, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="h-80 relative">
      {loading ? (
        <div className="w-full h-full bg-gray-200 rounded-md animate-pulse"></div>
      ) : (
        children
      )}
    </div>
  </div>
);

// --- Framer Motion Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// --- Main AdminDashboard Component ---
export default function AdminDashboard({ setActiveMenuItem }) { // Assuming this prop is passed for navigation
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  // Simulate fetching data on component mount
  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        // --- Full KPI Card Data ---
        setStats({
          buyers: 8430,
          sellers: 1250,
          smes: 412,
          fpos: 85,
          orders: 22456,
          products: 45200,
          dailyTickets: 15,
        });

        // --- All Chart Data ---
        setChartData({
          userGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ label: 'Users', data: [6500, 6900, 7100, 7500, 8000, 8430], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }],
          },
          orderVolume: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ label: 'Orders', data: [2100, 2800, 3500, 3200, 4100, 5200], backgroundColor: '#f97316' }],
          },
          entityDistribution: {
            labels: ['SME', 'FPO'],
            datasets: [{ label: 'Entity Count', data: [412, 85], backgroundColor: ['#8b5cf6', '#ec4899'] }],
          },
          ticketTrends: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ label: 'New Tickets', data: [12, 19, 8, 15, 22, 14, 10], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.4 }],
          },
        });

        setLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  // Full data array for mapping over the StatCards
  const kpiCards = [
    { title: 'Total Buyers', value: stats.buyers, linkTo: 'Customers' },
    { title: 'Total Sellers', value: stats.sellers, linkTo: 'SME' }, // Assuming SME is the main seller page
    { title: 'Total SMEs', value: stats.smes, linkTo: 'SME' },
    { title: 'Total FPOs', value: stats.fpos, linkTo: 'FPO' },
    { title: 'Total Orders', value: stats.orders, linkTo: 'Orders' },
    { title: 'Total Products', value: stats.products, linkTo: 'Orders' }, // Placeholder link
    { title: 'Daily Tickets', value: stats.dailyTickets, linkTo: 'Buyer Support' },
  ];

  // Common options for the charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { drawBorder: false } }, x: { grid: { display: false } } },
  };

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time business overview and performance metrics.</p>
        </motion.header>

        {/* --- KPI Cards Section (Using a responsive grid to prevent overflow) --- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
        >
          {kpiCards.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatCard {...card} loading={loading} onClick={() => setActiveMenuItem ? setActiveMenuItem(card.linkTo) : null} />
            </motion.div>
          ))}
        </motion.div>

        {/* --- Charts Section --- */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <ChartContainer title="User Growth Trends" loading={loading}>
              {chartData.userGrowth && <Line options={chartOptions} data={chartData.userGrowth} />}
            </ChartContainer>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ChartContainer title="Monthly Order Volume" loading={loading}>
              {chartData.orderVolume && <Bar options={chartOptions} data={chartData.orderVolume} />}
            </ChartContainer>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ChartContainer title="FPO vs SME Distribution" loading={loading}>
                {chartData.entityDistribution && <Bar options={{ ...chartOptions, indexAxis: 'y' }} data={chartData.entityDistribution} />}
            </ChartContainer>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ChartContainer title="Daily Support Tickets" loading={loading}>
                {chartData.ticketTrends && <Line options={chartOptions} data={chartData.ticketTrends} />}
            </ChartContainer>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}