// admin/components/AdminCustomerDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Use useParams to get ID from URL
import { ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react'; // Import relevant icons

// You'll need a way to get a specific user's detailed data
// For now, let's re-use the mock data structure but assume it fetches just one
// In a real app, you'd fetch from an API: /services/admin/users/:userId
 const allAdminUsersData = [ // Include admin/editor here for admin's view
    { id: 1, name: 'Admin User', email: 'admin@retrend.com', role: 'admin', lastActive: '2025-04-30', status: 'active', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=AU&radius=50', phone: '111-222-3333', address: '123 Admin St' },
    { id: 2, name: 'Sarah Johnson', email: 'user1@example.com', role: 'customer', lastActive: '2025-04-25', status: 'active', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=SJ&radius=50', phone: '555-123-4567', address: '789 Oak Ave' },
    { id: 3, name: 'Michael Chen', email: 'user2@example.com', role: 'customer', lastActive: '2025-04-20', status: 'inactive', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=MC&radius=50', phone: '555-987-6543', address: '101 Pine Blvd' },
     { id: 4, name: 'Jessica Smith', email: 'user3@example.com', role: 'editor',lastActive: '2025-04-29', status: 'active', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=JS&radius=50', phone: '555-444-5555', address: '222 Cedar Lane' },
    { id: 5, name: 'Customer Alpha', email: 'customerA@example.com', role: 'customer',lastActive: '2025-05-01', status: 'active', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=CA&radius=50', phone: '555-888-9999', address: '333 Maple Dr' },
    { id: 6, name: 'Inactive Customer', email: 'inactiveC@example.com', role: 'customer', lastActive: '2025-03-15', status: 'inactive', avatar: 'https://services.dicebear.com/7.x/initials/svg?seed=IC&radius=50', phone: null, address: null},

 ];

const simulateFetchUserDetails = async (userId) => {
   await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
   // In a real app, this would filter based on the actual fetched data
    const user = allAdminUsersData.find(u => u.id === parseInt(userId));
    return user || null; // Return user object or null if not found
}

export default function AdminCustomerDetails() {
    const { userId } = useParams(); // Get the user ID from the URL route parameters
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCustomerDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // In a real app: const response = await fetch(`/services/admin/users/${userId}`);
                // In a real app: if (!response.ok) throw new Error('Failed to fetch user');
                // In a real app: const data = await response.json();

                // Simulated fetch:
                const data = await simulateFetchUserDetails(userId);

                if (!data) {
                    setError(`Customer with ID ${userId} not found.`);
                } else {
                    setCustomer(data);
                }

            } catch (err) {
                console.error("Error loading customer details:", err);
                setError(`Could not load customer details: ${err.message || 'Unknown error'}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) { // Only try to load if we have an ID from the URL
            loadCustomerDetails();
        } else {
             // Handle case where no ID is provided in the URL (shouldn't happen if routed correctly)
             setError("No customer ID provided.");
             setIsLoading(false);
        }

    }, [userId]); // Re-run effect if the userId in the URL changes

    if (isLoading) {
        return <div className="max-w-3xl mx-auto p-6 text-center">Loading customer details...</div>;
    }

    if (error) {
        return <div className="max-w-3xl mx-auto p-6 text-center text-red-600">{error}</div>;
    }

    if (!customer) {
         return <div className="max-w-3xl mx-auto p-6 text-center text-gray-600">Customer details not found.</div>; // Should be covered by error state, but safe check
    }


    return (
         <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md my-6">
             {/* Back Button */}
             <button
                 onClick={() => navigate('/admin/orders')} // Go back to orders list
                 className="mb-6 text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
             >
                 <ArrowLeft size={16} /> Back to Orders
             </button>

             {/* Customer Details Card */}
            <div className="flex items-center border-b pb-6 mb-6">
                 <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden mr-4">
                     <img src={customer.avatar} alt={customer.name + "'s avatar"} className="h-full w-full object-cover" />
                 </div>
                 <div>
                     <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
                     {/* Maybe show Role if useful in details view */}
                     {customer.role && <span className="text-sm text-gray-600">({customer.role.charAt(0).toUpperCase() + customer.role.slice(1)})</span>}
                 </div>
             </div>

             {/* Detailed Information */}
             <div className="space-y-4 text-gray-700">
                 <div className="flex items-center gap-3">
                     <Mail size={20} className="text-gray-600 flex-shrink-0"/>
                     <p>Email: <span className="font-semibold text-gray-800">{customer.email}</span></p>
                 </div>
                  {customer.phone && ( // Conditionally display phone
                     <div className="flex items-center gap-3">
                        <Phone size={20} className="text-gray-600 flex-shrink-0"/>
                         <p>Phone: <span className="font-semibold text-gray-800">{customer.phone}</span></p>
                     </div>
                  )}
                   {customer.address && ( // Conditionally display address
                     <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-gray-600 flex-shrink-0 mt-1"/>
                         <p>Address: <span className="font-semibold text-gray-800">{customer.address}</span></p>
                     </div>
                   )}
                  {/* Add other relevant details like:
                    - Account creation date
                    - Last login/active date
                    - Total orders count (would require querying orders data)
                    - Lifetime spend (would require querying orders data)
                    - Points balance (if applicable, from user object)
                  */}
                  {customer.lastActive && (
                       <div className="flex items-center gap-3">
                            <User size={20} className="text-gray-600 flex-shrink-0"/> {/* Reuse User icon for general info */}
                           <p>Last Active: <span className="font-semibold text-gray-800">{customer.lastActive}</span></p> {/* Format date if needed */}
                       </div>
                   )}
                  {customer.points != null && ( // Check if points exists and is not null
                       <div className="flex items-center gap-3">
                            <DollarSign size={20} className="text-gray-600 flex-shrink-0"/>
                           <p>Points: <span className="font-semibold text-gray-800">{customer.points?.toFixed(2) || '0.00'}</span></p>
                       </div>
                   )}

             </div>
              {/* You could add sections here for:
                  - List of their past orders (link back to AdminOrders with customer filter)
                  - List of items they are selling (link back to AdminProducts or a specific SellerItems view)
                  - Internal admin notes
              */}
         </div>
     );
}