// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaTag,
  FaTruck,
} from "react-icons/fa";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 backdrop-blur shadow-2xl border-r border-blue-100 p-7 flex flex-col">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link
            to="/admin"
            className="text-4xl font-extrabold tracking-tight text-blue-700 hover:text-blue-800 transition-colors"
            style={{ letterSpacing: "0.03em" }}
          >
            <span className="text-blue-400">Admin</span>
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-2">
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
            {/* <NavLink icon={<FaUsers />} to="/admin/users" label="Người dùng" /> */}
            <NavLink icon={<FaTag />} to="/admin/vouchers" label="Mã giảm giá" />
            <NavLink
              icon={<FaTruck />}
              to="/admin/shipping"
              label="Vận chuyển"
            />
          </ul>
        </nav>
        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-blue-100 text-center">
          <span className="text-xs text-gray-400 font-medium tracking-wide">
            Admin Panel v1.0
          </span>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="flex-grow p-8 md:p-12 bg-white/80 rounded-tl-3xl shadow-inner overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// Helper component for NavLink to reduce repetition
const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 text-base rounded-lg font-medium transition-all duration-200
          ${
            isActive
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          }`}
        style={{
          boxShadow: isActive
            ? "0 2px 12px 0 rgba(59,130,246,0.10)"
            : undefined,
        }}
      >
        {React.cloneElement(icon, {
          className: `w-5 h-5 flex-shrink-0 ${
            isActive
              ? "text-white"
              : "text-blue-400 group-hover:text-blue-600"
          }`,
        })}
        {label}
      </Link>
    </li>
  );
};
