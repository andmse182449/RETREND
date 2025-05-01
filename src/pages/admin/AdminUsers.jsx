import React, { useState, useEffect } from 'react' // Added useEffect for initial data fetch/filter
// Removed lucide-react imports we no longer use
import { Search, User, Mail } from 'lucide-react' // Only keep necessary icons
import { Link } from 'react-router-dom' // Import Link for user details


// --- Simulated Data (for testing UI) ---
// Retained for demonstration, would typically come from an API fetch
const allUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@retrend.com',
    role: 'admin',
    lastActive: '2025-04-30',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AU&radius=50' // Using dicebear for diverse avatars
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'user1@example.com',
    role: 'customer',
    lastActive: '2025-04-25',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ&radius=50'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'user2@example.com',
    role: 'customer',
    lastActive: '2025-04-20',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MC&radius=50'
  },
  {
    id: 4,
    name: 'Jessica Smith',
    email: 'user3@example.com',
    role: 'editor', // This user should NOT be displayed
    lastActive: '2025-04-29',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JS&radius=50'
  },
  {
    id: 5,
    name: 'Customer Alpha',
    email: 'customerA@example.com',
    role: 'customer',
    lastActive: '2025-05-01',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CA&radius=50'
  },
   {
    id: 6,
    name: 'Inactive Customer',
    email: 'inactiveC@example.com',
    role: 'customer',
    lastActive: '2025-03-15',
    status: 'inactive',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IC&radius=50'
  },
]
// ---------------------------------------------


export default function AdminUsers() {
  // We will filter the 'allUsers' data initially, so state reflects only visible users
  const [users, setUsers] = useState([]); // Will store only the *initial subset* (customers)
  const [allCustomers, setAllCustomers] = useState([]); // Keep original customer data
  const [searchTerm, setSearchTerm] = useState('')
  // roleFilter and selectedUsers state are no longer needed as we only view customers
  // const [roleFilter, setRoleFilter] = useState('all')
  // const [selectedUsers, setSelectedUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

    // Use useEffect to filter initial data on mount
    useEffect(() => {
        // In a real app, this would be where you fetch data from your backend API
        // For this demo, we're simulating filtering from the static array
        const initialCustomers = allUsers.filter(user => user.role === 'customer');
        setUsers(initialCustomers);
        setAllCustomers(initialCustomers); // Keep a copy of just customer data
    }, []); // Empty dependency array means this runs once on component mount


  // Removed handlers for Add, Delete, Change Role, Select

  // Helper for Status Badge
  const getStatusClass = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

    // Role display is simplified since we only show customers
    // Leaving the icon logic in getRoleIcon might still be useful if role filtering
    // between 'customer' and other potential *future* view-only roles is needed,
    // but removing getRoleClass as we only show customer role here.
    const getRoleIcon = (role) => {
      switch(role) {
        case 'customer': return <User size={16} className="text-blue-500" />
        default: return <User size={16} className="text-gray-500" /> // Fallback
      }
    }


  // Filter users based on search term and status
  const filteredUsers = users.filter(user => { // Now filtering from the 'users' state (which is already just customers)
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter is removed as we only display 'customer' roles
    // const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus; // Only filter by search and status
  });

  // Note: Pagination is not implemented for dynamic slicing/loading in this example,
  // it only shows "1 of 1" page and enabled/disabled states are placeholder.
  // A full implementation would require state for current page, items per page,
  // and modifying the filteredUsers slicing logic.

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8"> {/* Removed the Add User button container flex justify-between */}
        <h1 className="text-3xl font-bold text-gray-800">Customer Directory</h1> {/* Renamed heading */}
        <p className="text-gray-500 mt-1">View customer account information.</p> {/* Updated description */}
        {/* Removed Add User Button:
        <button className="...">
          <UserPlus size={18} /> Add User
        </button>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-center"> {/* Added items-center for vertical alignment */}
                {/* Removed Role Filter Select */}
                 <label htmlFor="statusFilter" className="text-sm text-gray-700 sr-only">Filter by Status</label> {/* Added label for accessibility */}
                <select
                  id="statusFilter" // Link label to select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted size and text color
                >
                  <option value="all">All Statuses</option> {/* Updated text */}
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
            </div>
          </div>

          {/* Removed Selected Users actions toolbar */}
          {/*
           {selectedUsers.length > 0 && (
            <div className="..."> ... </div>
           )}
          */}
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap"> {/* Added whitespace-nowrap to table for consistency */}
            <thead className="bg-gray-50">
              <tr>
                {/* Removed Checkbox Header */}
                 {/* The first visible column content will now take the initial left padding */}
                <th className="pl-6 pr-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th> {/* Changed heading text and padding */}
                {/* Removed Role column header as we only show customers */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                {/* Removed Actions header */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  {/* Updated colspan as columns are reduced (User, Status, Last Active) -> 3 columns visible */}
                   <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                    No customers found matching your filters. {/* Updated message */}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" > {/* Added cursor-pointer */}
                    {/* Removed Checkbox cell */}
                    {/* User Cell - Made the clickable part obvious */}
                    {/* Wrap the user name/email block in a Link or handle row click for detail */}
                     <td className="pl-6 pr-3 py-4 font-medium text-gray-900" onClick={() => {/* Handle navigation or show detail modal/panel */ alert('View details for ' + user.name) /* Replace alert with actual navigation */}}>
                       <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-3"> {/* Adjusted margin */}
                              <img src={user.avatar} alt={user.name + "'s avatar"} className="h-full w-full object-cover rounded-full" /> {/* Ensure full image cover and rounded */}
                           </div>
                           <div>
                             <div className="hover:underline text-blue-600">{user.name}</div> {/* Style name as a link cue */}
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={12} />
                                {user.email}
                              </div>
                           </div>
                       </div>
                    </td>

                    {/* Removed Role cell */}

                    {/* Status Cell */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(user.status)}`}>
                        <span className={`inline-block w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} mr-1`}></span>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    {/* Last Active Cell */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastActive} {/* Ideally format date */}
                    </td>
                    {/* Removed Actions Cell */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"> {/* Added responsiveness */}
          <p className="text-sm text-gray-600 text-center sm:text-left"> {/* Darker text, added text alignment */}
             Showing {filteredUsers.length} of {allCustomers.length} customers. {/* Updated total count source and text */}
          </p>
          {/* Pagination buttons (placeholders) - Keep as is for now */}
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
  )
}