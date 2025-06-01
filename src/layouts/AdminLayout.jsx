import React from "react";
import { Outlet, Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTag 
} from "react-icons/fa";
export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-300 p-4 flex flex-col"> {/* Added p-4, flex flex-col */}
        {/* Logo */}
        <div className="mb-6"> {/* Added margin bottom */}
          <Link to="/admin" className="text-2xl font-bold text-gray-800">
            Retrend Admin
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-grow"> {/* Added flex-grow to push logout down */}
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/admindashboard"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
              >
                <FaTachometerAlt className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
              >
                <FaBox className="mr-3" />
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
              >
                <FaShoppingCart className="mr-3" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
              >
                <FaUsers className="mr-3" />
                Users
              </Link>
            </li>
            {/* --- NEW: Vouchers Link --- */}
             <li>
               <Link
                 to="/admin/vouchers" // Updated path to /admin/vouchers
                 className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-md"
               >
                 <FaTag className="mr-3" /> {/* Using the Tag icon */}
                 Vouchers
               </Link>
             </li>
             {/* --- End NEW --- */}
          </ul>
        </nav>

        {/* Optional: Admin User Info / Logout Placeholder */}
        {/* You might want to add user info or a logout button here */}
         <div className="mt-auto pt-4 border-t border-gray-200"> {/* Added margin top auto and border top */}
            {/* Example: Logged-in admin user info */}
            {/* <div className="text-sm text-gray-600 text-center">Logged in as Admin</div> */}
            {/* Example Logout button */}
            {/* <button className="w-full px-4 py-2 mt-2 text-center bg-red-500 text-white rounded-md hover:bg-red-600">Logout</button> */}
         </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Outlet renders the matched child route component (AdminDashboard, AdminProducts, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}