import React, { useState, useEffect } from 'react'; // useEffect for mock data loading
import { FaPlusCircle, FaEdit, FaTrash, FaClipboard, FaTag, FaTimes, FaCheckCircle  } from 'react-icons/fa'; // Import icons

// --- Mock Voucher Data for Admin ---
// More comprehensive than customer side, includes IDs, dates, etc.
const mockAdminVouchers = [
    { id: 1, code: 'APRILFREESHIP', discount: 0, minOrder: 0, type: 'shipping', expiry: '2025-04-13', isActive: true, usageCount: 5 },
    { id: 2, code: 'APRIL50K', discount: 50000, minOrder: 899000, type: 'fixed', expiry: '2025-04-13', isActive: true, usageCount: 12 },
    { id: 3, code: 'TRENDY10', discount: 0.10, minOrder: 1000000, type: 'percentage', expiry: '2025-12-31', isActive: true, usageCount: 50 },
    { id: 4, code: 'SAVE100K', discount: 100000, minOrder: 1500000, type: 'fixed', expiry: '2025-06-30', isActive: true, usageCount: 22 },
    { id: 5, code: 'COMBO20', discount: 20000, minOrder: 0, type: 'fixed' , expiry: '2025-05-15', isActive: false, usageCount: 3}, // Inactive example
    { id: 6, code: 'APPONLY', discount: 0.05, minOrder: 500000, type: 'percentage' , expiry: null, isActive: true, usageCount: 100}, // No expiry example
];

// Helper to format date for display
const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    try {
        // Attempt to parse and format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
             return date.toLocaleDateString(); // Format as locale string (e.g., 4/13/2025)
        }
        // Fallback if parsing fails
        return dateString;
    } catch (e) {
        // Handle any other errors during date processing
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date';
    }
};

// Helper to display discount value based on type
const displayDiscount = (voucher) => {
    if (voucher.type === 'fixed') {
        return `${voucher.discount.toLocaleString()}₫`; // Format VND manually or use Intl if not needing full object
    }
    if (voucher.type === 'percentage') {
        return `${(voucher.discount * 100)}%`;
    }
    if (voucher.type === 'shipping') {
         return voucher.discount === 'free_shipping' ? 'Miễn phí vận chuyển' : `${voucher.discount.toLocaleString()}₫ vận chuyển`;
    }
    return 'N/A';
};

export default function AdminVouchers() {
  // State for the list of vouchers displayed in the table
  const [vouchers, setVouchers] = useState([]);
  // State to toggle the "Add New Voucher" form visibility
  const [showAddForm, setShowAddForm] = useState(false);
  // State for the data in the add/edit form
  const [voucherForm, setVoucherForm] = useState({
    code: '', discount: '', minOrder: '', type: 'fixed', expiry: '', isActive: true
  });
  // State to track if we are currently editing a voucher (null if adding)
  const [editingVoucherId, setEditingVoucherId] = useState(null);

  // --- Effect to load mock data on component mount ---
  useEffect(() => {
    // Simulate fetching data (replace with actual API call later)
    setVouchers(mockAdminVouchers);
  }, []); // Empty dependency array means this runs once


  // --- Form Handlers (for adding/editing) ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVoucherForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Handle checkbox boolean value
    }));
  };

  // Handler to start adding a new voucher
  const handleAddClick = () => {
    setEditingVoucherId(null); // Ensure not in edit mode
    setVoucherForm({ code: '', discount: '', minOrder: '', type: 'fixed', expiry: '', isActive: true }); // Reset form
    setShowAddForm(true); // Show the form
  };

  // Handler to start editing an existing voucher
  const handleEditClick = (voucher) => {
     setEditingVoucherId(voucher.id); // Set the ID of the voucher being edited
     setVoucherForm({ // Populate the form with the voucher's current data
        code: voucher.code,
        discount: voucher.discount,
        minOrder: voucher.minOrder,
        type: voucher.type,
        expiry: voucher.expiry || '', // Ensure expiry is string or empty for input
        isActive: voucher.isActive
     });
     setShowAddForm(true); // Show the form (it will pre-fill due to voucherForm state)
  };

  // Handler for submitting the Add/Edit form
  const handleSubmitForm = (e) => {
    e.preventDefault(); // Prevent page reload

    // Basic Validation (add more comprehensive validation as needed)
    if (!voucherForm.code || !voucherForm.type || (!['shipping'].includes(voucherForm.type) && typeof voucherForm.discount === 'string' && voucherForm.discount.trim() === '') ) {
         alert('Code, type, and discount value are required.'); // Basic browser alert (replace with better UI feedback)
         return;
     }

    // --- Add New or Update Existing Voucher ---
    if (editingVoucherId !== null) {
      // --- Update Existing Voucher ---
       console.log("Saving edits for voucher ID:", editingVoucherId, voucherForm);
      setVouchers(vouchers.map(v =>
        v.id === editingVoucherId ? { ...v, ...voucherForm, id: editingVoucherId } : v // Use voucherForm values, ensure ID is unchanged
      ));
      setEditingVoucherId(null); // Exit edit mode
      console.log("Voucher updated (mock).");
    } else {
      // --- Add New Voucher ---
       console.log("Adding new voucher:", voucherForm);
      const newId = vouchers.length ? Math.max(...vouchers.map(v => v.id)) + 1 : 1; // Simple new ID logic
      const newVoucher = { ...voucherForm, id: newId, usageCount: 0,
           discount: ['fixed', 'percentage', 'shipping'].includes(voucherForm.type) && voucherForm.type !== 'shipping' ? parseFloat(voucherForm.discount) : (voucherForm.type === 'shipping' ? 'free_shipping' : voucherForm.discount), // Convert discount to number unless shipping type
            minOrder: parseFloat(voucherForm.minOrder) || 0 // Ensure minOrder is number
      };
      setVouchers([...vouchers, newVoucher]); // Add to the list
      console.log("New voucher added (mock):", newVoucher);
    }

    // --- Reset and Hide Form ---
    setVoucherForm({ code: '', discount: '', minOrder: '', type: 'fixed', expiry: '', isActive: true });
    setShowAddForm(false); // Hide form
    setError(null); // Clear errors
    // Optional: Add success feedback (e.g., toast message)
  };

  // Handler to cancel adding/editing
  const handleCancelForm = () => {
     setEditingVoucherId(null); // Exit edit mode
     setVoucherForm({ code: '', discount: '', minOrder: '', type: 'fixed', expiry: '', isActive: true }); // Reset form
     setShowAddForm(false); // Hide form
     setError(null); // Clear errors
  };

  // Handler to delete a voucher
  const handleDeleteClick = (id) => {
    // In a real app, prompt user for confirmation and call API
    console.log("Attempting to delete voucher ID:", id);
    if (window.confirm(`Are you sure you want to delete voucher ID ${id}?`)) {
        setVouchers(vouchers.filter(v => v.id !== id)); // Remove from state
        console.log("Voucher deleted (mock).");
        // In a real app: Call API to delete voucher on backend
        // fetch(`/api/admin/vouchers/${id}`, { method: 'DELETE' }).then(...).catch(...)
    }
  };

   // Handler to copy voucher code
  const handleCopyClick = (code) => {
      navigator.clipboard.writeText(code)
          .then(() => alert(`Code "${code}" copied!`)) // Basic feedback
          .catch(err => console.error("Failed to copy code:", err));
   };

   // Placeholder for toggling active status (Implement if needed)
   const handleToggleActive = (voucher) => {
       console.log("Toggle active status for voucher:", voucher.code);
        // Update the 'isActive' property in state and call API
       setVouchers(vouchers.map(v => v.id === voucher.id ? {...v, isActive: !v.isActive} : v));
        // Call API to update status
   };


  // --- Filtering (Simple example) ---
  // Add state for search term, status filter, etc. if needed
  // const [searchTerm, setSearchTerm] = useState('');
  // const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Apply filters and search to the main vouchers list
  // For this basic example, we'll skip complex filtering and just list them
  // In a real table component, you'd implement filteredVouchers = vouchers.filter(...)


  return (
    <div className="max-w-6xl mx-auto px-4 py-6"> {/* Centered container */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Voucher Management</h1>
          <p className="text-gray-500 mt-1">View and manage promotional vouchers and coupons.</p>
        </div>
        {/* Button to open Add Voucher Form */}
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <FaPlusCircle size={18} />
          Add New Voucher
        </button>
      </div>

      {/* Add/Edit Voucher Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">{editingVoucherId !== null ? 'Edit Voucher' : 'Add New Voucher'}</h2>
          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
              <input type="text" id="code" name="code" value={voucherForm.code} onChange={handleFormChange} required className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-blue-500" />
            </div>
             {/* Discount Type/Value Input */}
            <div>
                 <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Discount Type / Value</label>
                  <div className="flex gap-2">
                      <select id="type" name="type" value={voucherForm.type} onChange={handleFormChange} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                         <option value="fixed">Fixed Amount (₫)</option>
                         <option value="percentage">Percentage (%)</option>
                          <option value="shipping">Free Shipping</option> {/* Or fixed shipping amount */}
                           {/* Add other types like 'buy_one_get_one' if needed */}
                      </select>
                      {/* Input field for discount amount (conditionally shown) */}
                       {voucherForm.type !== 'shipping' && (
                           <input type="number" name="discount" value={voucherForm.discount} onChange={handleFormChange} required={voucherForm.type !== 'shipping'} // Require if not shipping
                                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={voucherForm.type === 'fixed' ? 'e.g. 50000' : 'e.g. 10'} />
                       )}
                  </div>
             </div>
             {/* Minimum Order Value Input */}
             <div>
                 <label htmlFor="minOrder" className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₫)</label>
                 <input type="number" id="minOrder" name="minOrder" value={voucherForm.minOrder} onChange={handleFormChange} className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 100000" min="0"/>
             </div>
            {/* Expiry Date Input */}
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" id="expiry" name="expiry" value={voucherForm.expiry} onChange={handleFormChange} className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
             {/* Active Status Checkbox */}
             <div>
                <label htmlFor="isActive" className="flex items-center text-sm font-medium text-gray-700 mb-1 mt-2"> {/* Adjusted margin-top */}
                     <input type="checkbox" id="isActive" name="isActive" checked={voucherForm.isActive} onChange={handleFormChange} className="form-checkbox rounded text-blue-600 focus:ring-blue-500 mr-2" />
                      Is Active
                </label>
             </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end gap-2 mt-4"> {/* Use full width, align right, add margin top */}
               <button type="button" onClick={handleCancelForm} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
               <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  {editingVoucherId !== null ? 'Save Changes' : 'Add Voucher'}
               </button>
            </div>
          </form>
        </div>
      )}


      {/* Voucher Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th> {/* Optional usage count */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No vouchers found.</td> {/* Updated colspan */}
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className={`hover:bg-gray-50 ${!voucher.isActive ? 'bg-gray-100' : ''}`}> {/* Highlight inactive */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-blue-700">{voucher.code}</td> {/* Monospace for code */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{displayDiscount(voucher)}</td> {/* Use helper */}
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{voucher.minOrder > 0 ? `${voucher.minOrder.toLocaleString()}₫` : 'Any'}</td> {/* Display min order */}
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${voucher.expiry && new Date(voucher.expiry) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{formatDate(voucher.expiry)}</td> {/* Use helper, highlight expired */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${voucher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {voucher.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.usageCount || 0}</td> {/* Display usage count */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(voucher)}
                           className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label={`Edit voucher ${voucher.code}`}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                           onClick={() => handleDeleteClick(voucher.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                           aria-label={`Delete voucher ${voucher.code}`}
                        >
                          <FaTrash size={16} />
                        </button>
                         {/* Optional: Toggle Active Button */}
                         <button
                            onClick={() => handleToggleActive(voucher)}
                            className={`p-1 ${voucher.isActive ? 'text-amber-600' : 'text-green-600'} hover:opacity-70 transition-opacity`}
                             aria-label={`${voucher.isActive ? 'Deactivate' : 'Activate'} voucher ${voucher.code}`}
                          >
                             {/* Example icons for toggle */}
                             {voucher.isActive ? <FaTimes size={16} /> : <FaCheckCircle size={16} />} {/* Use FaTimes, FaCheckCircle */}
                          </button>

                         {/* Button to copy code */}
                         <button
                            onClick={() => handleCopyClick(voucher.code)}
                             className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                            aria-label={`Copy code for voucher ${voucher.code}`}
                         >
                            <FaClipboard size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Placeholder) */}
         {/* Implement pagination if needed based on number of vouchers */}
        {/* <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing X of Y vouchers</p>
          <div className="flex gap-2"> ... buttons ... </div>
        </div> */}
      </div>
    </div>
  );
}

// Note:
// 1. Make sure you have `react-icons/fa` installed.
// 2. You need to configure your router (e.g., in App.js) to render AdminLayout
//    and nest the new AdminVouchers component under the /admin/vouchers path:
//    <Route path="/admin" element={<AdminLayout />}>
//        ... other admin routes ...
//        <Route path="vouchers" element={<AdminVouchers />} /> {/* Adjust path */}
//    </Route>