import React, { useState, useEffect } from 'react';
// Removed icons we are no longer using or replaced
import { Truck, Package, CheckCircle, AlertCircle, Search, Filter, ExternalLink } from 'lucide-react'; // Imported ExternalLink for customer link icon
import { Link } from 'react-router-dom'; // Needed for customer profile link


// --- Simulated Data (for testing UI without a backend) ---
// Added userId to link orders to customers (requires matching IDs in user data)
const initialOrders = [
  { id: 1, userId: 2, customer: 'Sarah Johnson', total: 149.97, status: 'Processing', date: '2025-04-25' }, // Added userId 2
  { id: 2, userId: 3, customer: 'Michael Chen', total: 59.99, status: 'Shipped', date: '2025-04-23' }, // Added userId 3
  { id: 3, userId: 5, customer: 'Customer Alpha', total: 89.99, status: 'Delivered', date: '2025-04-20' }, // Added userId 5 (from User data)
   { id: 4, userId: 2, customer: 'Sarah Johnson', total: 35.00, status: 'Cancelled', date: '2025-04-18' }, // Added a cancelled order with userId
    { id: 5, userId: 3, customer: 'Michael Chen', total: 250.00, status: 'Processing', date: '2025-05-02' },
];
// ---------------------------------------------


export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders); // Use useState for the current order list
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // --- No longer needed as admin doesn't create orders ---
  // const [newOrder, setNewOrder] = useState(...)
  // const handleAddOrder = () => { ... }

  const updateStatus = (id, newStatus) => { // Renamed param to newStatus for clarity
    setOrders(
      orders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
     // In a real application, you would also call your backend API here
     console.log(`Updated status for Order ${id} to ${newStatus}`);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Processing': return <Package className="text-amber-500 mr-1" size={18} />; // Used amber for processing icon, added margin right
      case 'Shipped': return <Truck className="text-blue-500 mr-1" size={18} />; // Added margin right
      case 'Delivered': return <CheckCircle className="text-green-500 mr-1" size={18} />; // Added margin right
      case 'Cancelled': return <AlertCircle className="text-red-500 mr-1" size={18} />; // Added margin right
      default: return null; // Handle unknown status
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Processing': return 'bg-amber-100 text-amber-800'; // Amber background
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const customerSearchMatch = order.customer.toLowerCase().includes(searchTerm.toLowerCase());
     // Also allow searching by order ID if searchTerm is a number (or looks like an ID)
    const idSearchMatch = searchTerm.startsWith('#')
        ? order.id.toString().includes(searchTerm.substring(1)) // If search starts with #, match order ID
        : order.id.toString().includes(searchTerm); // Otherwise, match order ID anywhere


    const matchesSearch = customerSearchMatch || idSearchMatch;

    const matchesFilter = filter === 'All' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-500 mt-1">View and update order statuses.</p> {/* Updated description */}
        </div>
         {/* Export Orders Button - Keep as non-functional placeholder */}
         {/* Changed button wrapper to center a single item or just have the button */}
         <button
           // onClick={() => handleExport()} // No implementation needed per requirement
           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
         >
           Export Orders {/* Button text */}
         </button>

         {/* Removed '+ New Order' button:
          <button className="...">+ New Order</button>
         */}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md"> {/* Limited max-width of search input */}
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer or order ID..." // Updated placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-center"> {/* Aligned filter items vertically */}
               {/* Added label for accessibility */}
              <label htmlFor="statusFilter" className="text-sm text-gray-700 sr-only">Filter by Status</label>
              <Filter size={18} className="text-gray-500 flex-shrink-0" /> {/* Filter icon */}
              <select
                id="statusFilter" // Linked label
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]" // Added min-width to prevent jumping
              >
                <option value="All">All Statuses</option> {/* Corrected option text */}
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                 {/* Add other options like 'Pending Payment', 'Returned' etc if needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Order Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200"> {/* Use min-w-full */}
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th> {/* Added scope="col" for accessibility */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 {/* This column acts as the place for the status update dropdown */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th> {/* Changed header text */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  {/* Colspan updated to 6 */}
                  <td colSpan="6" className="text-center py-10 text-gray-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    {/* Order ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>

                    {/* Customer - Link to Customer Profile (Admin View) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {/* Wrap customer name in a Link component */}
                       {/* Assuming a route /admin/users/:userId exists for admin customer details */}
                        <Link
                          to={`/admin/users/${order.userId}`} // This link TARGETs the (currently non-existent) detail page
                          className="text-blue-600 hover:underline flex items-center gap-1" // Styled as link with icon
                          // onClick={ (e) => { if (!order.userId) e.preventDefault(); /* Optional: prevent if no user id */ } } // Prevent default if no user ID? Or just don't render link?
                        >
                          {order.customer}
                           {/* Only show the link icon if there's a valid userId */}
                           {order.userId && <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />}
                        </Link>
                         {/* Fallback if no userId - maybe just display the name */}
                          {!order.userId && <span>{order.customer}</span>}

                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.total?.toFixed(2) || 'N/A'}</td> {/* Safe access and formatting */}

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>

                    {/* Update Status Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {/* Use a standard HTML select for simplicity and status updates */}
                       {/* Only allow updating status if not Cancelled? Add condition if needed */}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className="border border-gray-300 rounded-md shadow-sm pl-2 pr-8 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {/* Options should typically include statuses allowed for transition from current status */}
                                {/* For simplicity, listing all options here, but ideally control options based on current status */}
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                {/* <option value="Cancelled">Cancelled</option> {/* Allow cancellation only if logic permits? */}
                            </select>
                        ) : (
                             // If status is Delivered or Cancelled, maybe just display the status and not a dropdown
                            <span className="text-gray-700 italic text-xs">{order.status} status is final</span>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Kept as non-functional placeholder */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p> {/* Keep original total count for simplicity of demo */}
           {/* Placeholder Pagination Buttons - Functionality not included */}
          {/*
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-md text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}