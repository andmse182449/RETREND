// src/layouts/AdminLayout.js
import React from "react";
import { Outlet, Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTag,
  FaTruck, // Added FaTruck for Shipping Methods
} from "react-icons/fa";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {" "}
      {/* Changed bg-gray-50 to bg-gray-100 for a slightly different shade */}
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 p-6 flex flex-col">
        {" "}
        {/* Increased padding, shadow, border color */}
        {/* Logo */}
        <div className="mb-8 text-center">
          {" "}
          {/* Increased margin bottom, centered logo */}
          <Link
            to="/admin"
            className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Retrend Admin
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-grow space-y-1.5">
          {" "}
          {/* Slightly reduced space between items for more links */}
          <NavLink
            icon={<FaTachometerAlt />}
            to="/admin/admindashboard"
            label="Dashboard"
          />
          <NavLink icon={<FaBox />} to="/admin/products" label="Sản phẩm" />
          <NavLink
            icon={<FaShoppingCart />}
            to="/admin/orders"
            label="Đơn hàng"
          />
          <NavLink icon={<FaUsers />} to="/admin/users" label="Người dùng" />
          <NavLink icon={<FaTag />} to="/admin/vouchers" label="Mã giảm giá" />
          {/* --- NEW: Shipping Methods Link --- */}
          <NavLink
            icon={<FaTruck />}
            to="/admin/shipping"
            label="Vận chuyển"
          />
          {/* --- End NEW --- */}
        </nav>
        {/* Optional: Admin User Info / Logout Placeholder */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          {/* Example: Could display logged-in admin's name or role */}
          {/* <div className="p-2 text-center text-xs text-gray-500">Admin Panel v1.0</div> */}
          {/* <button 
            onClick={() => { // Placeholder for logout
                console.log("Logout clicked");
                // navigate('/logout'); // Or clear auth token and redirect
            }}
            className="w-full mt-2 text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors font-medium flex items-center"
          >
            <FaSignOutAlt className="mr-3" /> Đăng xuất 
          </button> */}
          {/* You might need to import FaSignOutAlt if you use it */}
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
        {" "}
        {/* Added padding and overflow-y-auto */}
        {/* Removed container and mx-auto from main, as pages themselves should handle their max-width */}
        <Outlet />
      </main>
    </div>
  );
}

// Helper component for NavLink to reduce repetition
const NavLink = ({ to, icon, label }) => {
  // You could use useLocation and NavLink from react-router-dom for active styling
  // For simplicity, this is just a styled Link.
  const [isActive, setIsActive] = React.useState(false); // Placeholder for active state
  const location = React.useContext(React.createContext(null)); // Mock context for location

  // This is a simplified active check. For robust active links, use NavLink from react-router-dom.
  // useEffect(() => {
  //   if (location && location.pathname.startsWith(to)) {
  //     setIsActive(true);
  //   } else {
  //     setIsActive(false);
  //   }
  // }, [location, to]);

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center px-4 py-2.5 text-sm rounded-md transition-all duration-200 ease-in-out group
                    ${
                      isActive
                        ? "bg-blue-500 text-white shadow-md font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                    }`}
      >
        {React.cloneElement(icon, {
          className: `mr-3 w-5 h-5 flex-shrink-0 ${
            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"
          }`,
        })}
        {label}
      </Link>
    </li>
  );
};
