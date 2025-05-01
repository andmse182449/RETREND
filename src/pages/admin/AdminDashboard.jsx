import React, { useState } from 'react';
import { BarChart, PieChart, LineChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, Eye, TrendingUp, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);

  // Sample data - would be replaced with actual data from your backend
  const salesData = [
    { name: 'Jan', sales: 4000, returns: 240 },
    { name: 'Feb', sales: 3000, returns: 198 },
    { name: 'Mar', sales: 5000, returns: 300 },
    { name: 'Apr', sales: 2780, returns: 190 },
    { name: 'May', sales: 1890, returns: 130 },
    { name: 'Jun', sales: 2390, returns: 150 },
    { name: 'Jul', sales: 3490, returns: 210 },
  ];

  const categoryData = [
    { name: 'Clothing', value: 400 },
    { name: 'Accessories', value: 300 },
    { name: 'Footwear', value: 200 },
    { name: 'Home', value: 100 },
  ];

  const visitorData = [
    { name: 'Mon', visits: 1200 },
    { name: 'Tue', visits: 1400 },
    { name: 'Wed', visits: 1300 },
    { name: 'Thu', visits: 1700 },
    { name: 'Fri', visits: 2100 },
    { name: 'Sat', visits: 2400 },
    { name: 'Sun', visits: 1800 },
  ];

  const recentProducts = [
    { id: 1, name: 'Premium T-Shirt', price: '$29.99', stock: 45, category: 'Clothing', status: 'Active' },
    { id: 2, name: 'Designer Jeans', price: '$89.99', stock: 23, category: 'Clothing', status: 'Active' },
    { id: 3, name: 'Leather Wallet', price: '$49.99', stock: 12, category: 'Accessories', status: 'Low Stock' },
    { id: 4, name: 'Running Shoes', price: '$129.99', stock: 8, category: 'Footwear', status: 'Low Stock' },
    { id: 5, name: 'Decorative Pillow', price: '$19.99', stock: 0, category: 'Home', status: 'Out of Stock' },
  ];

  const recentOrders = [
    { id: '#ORD-7391', customer: 'John Doe', date: '30 Apr 2025', total: '$219.97', status: 'Delivered' },
    { id: '#ORD-7390', customer: 'Jane Smith', date: '30 Apr 2025', total: '$129.99', status: 'Processing' },
    { id: '#ORD-7389', customer: 'Robert Johnson', date: '29 Apr 2025', total: '$89.99', status: 'Shipped' },
    { id: '#ORD-7388', customer: 'Lisa Brown', date: '29 Apr 2025', total: '$149.98', status: 'Delivered' },
    { id: '#ORD-7387', customer: 'Michael Wilson', date: '28 Apr 2025', total: '$59.99', status: 'Processing' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', joined: '30 Apr 2025', orders: 5 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', joined: '29 Apr 2025', orders: 2 },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', joined: '28 Apr 2025', orders: 1 },
    { id: 4, name: 'Lisa Brown', email: 'lisa.brown@example.com', joined: '25 Apr 2025', orders: 8 },
    { id: 5, name: 'Michael Wilson', email: 'm.wilson@example.com', joined: '22 Apr 2025', orders: 3 },
  ];

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
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
                  <p className="text-2xl font-semibold">$14,789.00</p>
                  <p className="text-green-500 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> +12.5% from last month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Orders</h3>
                  <p className="text-2xl font-semibold">127</p>
                  <p className="text-green-500 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> +8.2% from last month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-amber-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Customers</h3>
                  <p className="text-2xl font-semibold">843</p>
                  <p className="text-green-500 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> +5.7% from last month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Total Visits</h3>
                  <p className="text-2xl font-semibold">12,492</p>
                  <p className="text-green-500 text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> +18.3% from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Sales Overview</h2>
                  <select className="border rounded-md px-2 py-1 text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#4F46E5" />
                    <Bar dataKey="returns" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Website Traffic</h2>
                  <select className="border rounded-md px-2 py-1 text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 3 months</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Product Categories</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false}
                      outerRadius={80} 
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#4F46E5', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Products */}
              <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Products</h2>
                  <button 
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={() => toggleSection('products')}
                  >
                    {expandedSection === 'products' ? (
                      <>View Less <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>View All <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentProducts.slice(0, expandedSection === 'products' ? recentProducts.length : 3).map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              product.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Orders and Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Orders</h2>
                  <button 
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={() => toggleSection('orders')}
                  >
                    {expandedSection === 'orders' ? (
                      <>View Less <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>View All <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.slice(0, expandedSection === 'orders' ? recentOrders.length : 3).map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.customer}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{order.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.total}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Users</h2>
                  <button 
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={() => toggleSection('users')}
                  >
                    {expandedSection === 'users' ? (
                      <>View Less <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>View All <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.slice(0, expandedSection === 'users' ? recentUsers.length : 3).map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.joined}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.orders}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

     
      </div>
    </div>
  );
}