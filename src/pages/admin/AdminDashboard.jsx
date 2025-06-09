import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, LineChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, Eye, TrendingUp, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import adminAPIService from '../../services/AdminService';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    orderStatusCounts: {}
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [revenueRes, ordersRes, customersRes, statusRes] = await Promise.all([
          adminAPIService.getTotalPrice(),
          adminAPIService.getTotalOrderCount(),
          adminAPIService.getTotalCustomer(),
          adminAPIService.getTotalOrderCountByStatus()
        ]);

        setStats({
          totalRevenue: revenueRes || 0,
          totalOrders: ordersRes || 0,
          totalCustomers: customersRes || 0,
          orderStatusCounts: statusRes.data || {}
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0, // thường VND không dùng thập phân
    maximumFractionDigits: 0
  }).format(value);
};


  // Prepare data for the order status chart
  const orderStatusData = Object.entries(stats.orderStatusCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Colors for the order status chart (cập nhật theo trạng thái thực tế)
  const statusColors = {
    'Paid': '#6366F1',             // Indigo
    'Confirmed': '#10B981',        // Emerald
    'Awaiting Payment': '#F59E42', // Orange
    'Pending': '#FBBF24',          // Yellow
    'Complete': '#3B82F6',         // Blue
    'Cancelled': '#EF4444',        // Red
    'Processing': '#F59E0B',       // Amber
    'Shipped': '#06B6D4',          // Cyan
    // Thêm các trạng thái khác nếu có
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +12.5% from last month
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Orders</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +8.2% from last month
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-amber-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Customers</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{stats.totalCustomers}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +5.7% from last month
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Order Status Summary Cards */}
              {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
                <div key={status} className="bg-white rounded-lg shadow p-6 flex items-center">
                  <div className={`bg-${statusColors[status]?.replace('#', '')}-100 p-3 rounded-full`}>
                    <Package className={`h-6 w-6 text-${statusColors[status]?.replace('#', '')}-500`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">{status} Orders</h3>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Status Chart */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Order Status Distribution</h2>
              </div>
              {loading ? (
                <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.name] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}