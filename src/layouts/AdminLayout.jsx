import React from "react";
import { Outlet, Link } from "react-router-dom";
import { FaTachometerAlt, FaBox, FaShoppingCart, FaUsers } from "react-icons/fa"; // Importing icons

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-300">
        <div className="p-4">
          <Link to="/admin" className="text-2xl font-bold text-gray-800">
            Retrend Admin
          </Link>
        </div>
        <nav className="mt-4">
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
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}