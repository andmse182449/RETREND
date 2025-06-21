import React, { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllOrders, getAllOrdersByStatus } from '../../services/OrderService';

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Awaiting Payment', label: 'Awaiting Payment' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Complete', label: 'Complete' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch all orders or by status
  useEffect(() => {
    setLoading(true);
    const fetchOrders = async () => {
      try {
        let data = [];
        if (filter === 'All') {
          data = await getAllOrders();
        } else {
          data = await getAllOrdersByStatus(filter);
        }
        setOrders(data || []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Package className="text-amber-500 mr-1" size={18} />;
      case 'Awaiting Payment': return <AlertCircle className="text-blue-500 mr-1" size={18} />;
      case 'Confirmed': return <CheckCircle className="text-green-500 mr-1" size={18} />;
      case 'Paid': return <CheckCircle className="text-green-700 mr-1" size={18} />;
      case 'Complete': return <CheckCircle className="text-green-900 mr-1" size={18} />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Awaiting Payment': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Paid': return 'bg-green-200 text-green-900';
      case 'Complete': return 'bg-gray-200 text-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const customer = order.customer || order.userId || '';
    const customerSearchMatch = customer.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const idSearchMatch = order.id?.toString().includes(searchTerm.replace('#', ''));
    return customerSearchMatch || idSearchMatch;
  });

  const pagedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
          Export Orders
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="statusFilter" className="text-sm text-gray-700 sr-only">Filter by Status</label>
              <Filter size={18} className="text-gray-500 flex-shrink-0" />
              <select
                id="statusFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Order Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">Loading...</td>
                </tr>
              ) : pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">No orders found.</td>
                </tr>
              ) : (
                pagedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt instanceof Date
                        ? order.createdAt.toISOString().slice(0, 10)
                        : order.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.totalPrice ? order.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p>
        </div>
        <div className="flex gap-2 justify-center mt-4 mb-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 border ${currentPage === i + 1 ? "bg-blue-50 border-blue-200 text-blue-600" : "border-gray-300"} rounded-md text-sm`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}