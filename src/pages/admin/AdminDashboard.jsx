import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, LineChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react';
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
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [monthlyCustomers, setMonthlyCustomers] = useState([]);
  const [monthlyProducts, setMonthlyProducts] = useState([]);
  const [productStatusData, setProductStatusData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [errorMonthly, setErrorMonthly] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
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
        console.error('Không thể tải dữ liệu tổng quan:', err);
        setError(err.message || 'Không thể tải dữ liệu tổng quan');
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoadingMonthly(true);
      setErrorMonthly(null);
      try {
        const [revenueRes, customerRes] = await Promise.all([
          adminAPIService.getMonthlyRevenueStats(selectedYear),
          adminAPIService.getMonthlyNewCustomers(selectedYear),
        ]);
        setMonthlyRevenue(
          fillMonthlyData(revenueRes.data || revenueRes || [], ["orderRevenue", "sellerPackageRevenue"])
        );
        setMonthlyCustomers(
          fillMonthlyData(customerRes.data || customerRes || [], ["newCustomerCount"])
        );
      } catch (err) {
        setErrorMonthly(err.message || "Không thể tải dữ liệu biểu đồ tháng");
      }
      setLoadingMonthly(false);
    };
    fetchMonthlyData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchProductCharts = async () => {
      setLoadingProduct(true);
      setErrorProduct(null);
      try {
        // API trả về dạng {1: 10, 2: 5, ...}
        const monthlyRes = await adminAPIService.getNewProductsByMonth(selectedYear);
        // API trả về dạng {ACTIVE: 10, INACTIVE: 5, ...}
        const statusRes = await adminAPIService.getProductStatusDistribution();

        console.log("getNewProductsByMonth response:", monthlyRes);
        console.log("getProductStatusDistribution response:", statusRes);

        // Chuẩn hóa dữ liệu cho chart cột (12 tháng)
        const monthlyArr = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          newProductCount: monthlyRes[i + 1] || 0 // SỬA: bỏ .data
        }));
        setMonthlyProducts(monthlyArr);

        // Chuẩn hóa dữ liệu cho chart tròn
        const statusArr = Object.entries(statusRes).map(([name, value]) => ({ name, value })); // SỬA: bỏ .data
        setProductStatusData(statusArr);

      } catch (err) {
        setErrorProduct(err.message || "Không thể tải dữ liệu sản phẩm");
      }
      setLoadingProduct(false);
    };
    fetchProductCharts();
  }, [selectedYear]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const orderStatusData = Object.entries(stats.orderStatusCounts).map(([name, value]) => ({
    name,
    value
  }));

  const statusColors = {
    'Paid': '#6366F1',
    'Confirmed': '#10B981',
    'Awaiting Payment': '#F59E42',
    'Pending': '#FBBF24',
    'Complete': '#3B82F6',
    'Cancelled': '#EF4444',
    'Processing': '#F59E0B',
    'Shipped': '#06B6D4',
  };

  function fillMonthlyData(raw, keys = []) {
    const monthMap = {};
    raw.forEach(item => {
      monthMap[item.month] = item;
    });
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthMap[month];
      const base = { month };
      keys.forEach(k => base[k] = 0);
      return found ? { ...base, ...found } : base;
    });
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            {/* Tổng quan thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +12.5% so với tháng trước
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
                  <h3 className="text-gray-500 text-sm">Tổng đơn hàng</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +8.2% so với tháng trước
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
                  <h3 className="text-gray-500 text-sm">Tổng khách hàng</h3>
                  {loading ? (
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold">{stats.totalCustomers}</p>
                      <p className="text-green-500 text-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +5.7% so với tháng trước
                      </p>
                    </>
                  )}
                </div>
              </div>
              {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
                <div key={status} className="bg-white rounded-lg shadow p-6 flex items-center">
                  <div className={`bg-${statusColors[status]?.replace('#', '')}-100 p-3 rounded-full`}>
                    <Package className={`h-6 w-6 text-${statusColors[status]?.replace('#', '')}-500`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">{status} đơn hàng</h3>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bộ lọc năm */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm font-medium text-gray-600">Năm:</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[...Array(5)].map((_, idx) => {
                  const year = new Date().getFullYear() - idx;
                  return (
                    <option key={year} value={year}>{year}</option>
                  );
                })}
              </select>
            </div>

            {/* Hàng 2: Doanh thu & Khách hàng mới */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Doanh thu theo tháng ({selectedYear})</h2>
                </div>
                {loadingMonthly ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
                ) : errorMonthly ? (
                  <div className="text-red-500">{errorMonthly}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickFormatter={m => `Th${m}`} />
                      <YAxis tickFormatter={v => v.toLocaleString()} />
                      <Tooltip formatter={v => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="orderRevenue" name="Doanh thu đơn hàng" fill="#6366F1" />
                      <Bar dataKey="sellerPackageRevenue" name="Doanh thu gói người bán" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Khách hàng mới theo tháng ({selectedYear})</h2>
                </div>
                {loadingMonthly ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
                ) : errorMonthly ? (
                  <div className="text-red-500">{errorMonthly}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyCustomers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickFormatter={m => `Th${m}`} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="newCustomerCount" name="Khách hàng mới" stroke="#F59E42" strokeWidth={3} dot />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Hàng 3: Sản phẩm mới & Trạng thái sản phẩm */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Sản phẩm mới theo tháng ({selectedYear})</h2>
                </div>
                {loadingProduct ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
                ) : errorProduct ? (
                  <div className="text-red-500">{errorProduct}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickFormatter={m => `Th${m}`} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="newProductCount" name="Sản phẩm mới" fill="#F59E42" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Phân bố trạng thái sản phẩm</h2>
                </div>
                {loadingProduct ? (
                  <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
                ) : errorProduct ? (
                  <div className="text-red-500">{errorProduct}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {productStatusData.map((entry, index) => (
                          <Cell key={`cell-product-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} sản phẩm`, 'Số lượng']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Hàng 4: Trạng thái đơn hàng (full width) */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Phân bố trạng thái đơn hàng</h2>
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
                    <Tooltip formatter={(value) => [`${value} đơn hàng`, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Thông báo lỗi */}
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