// src/components/CustomerHeader.js
import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaChevronDown,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function CustomerHeader({
  isSearchOpen,
  toggleSearch,
  searchTerm,
  setSearchTerm,
  handleSearchSubmit,
  totalItemsCount,
  onOpenCart,
}) {
  return (
    // REMOVED 'fixed top-0 left-0' and potentially 'z-40' if not needed for other absolute elements within header
    // Added 'relative' for the search dropdown to position correctly
    <header className="bg-white shadow-sm w-full h-16 flex items-center relative">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-4xl font-['Georgia',serif] font-bold lowercase text-gray-800 tracking-tighter"
        >
          retrend.
        </Link>

        {/* Main Text Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-800">
          <Link to="/" className="hover:text-gray-600">
            TRANG CHỦ
          </Link>
          <Link to="/products" className="hover:text-gray-600">
            TẤT CẢ SẢN PHẨM
          </Link>
          <div className="relative group">
            {" "}
            {/* This 'relative' is fine for dropdown positioning */}
            <button className="flex items-center text-sm font-medium text-gray-800 hover:text-gray-600 cursor-pointer">
              CHÍNH SÁCH MUA HÀNG{" "}
              <FaChevronDown className="ml-1 w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded py-2 w-52 z-20 top-full border border-gray-200">
              {/* Dropdown links */}
              <Link
                to="/returns"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Chính sách đổi / trả
              </Link>
              <Link
                to="/shipping"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Chính sách vận chuyển
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Liên hệ
              </Link>
            </div>
          </div>
          <Link to="/feedback" className="hover:text-gray-600">
            ĐÁNH GIÁ
          </Link>
        </nav>

        {/* Icon-only Navigation / Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSearch}
            className="text-gray-800 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            <FaSearch size={20} />
          </button>
          <Link
            to="/profile"
            className="text-gray-800 hover:text-gray-600 w-6 h-6 flex items-center justify-center"
            aria-label="User Profile"
          >
            <FaUser size={20} />
          </Link>
          <button
            onClick={onOpenCart}
            className="flex items-center justify-center text-gray-800 hover:text-gray-600 relative w-6 h-6" // 'relative' for badge positioning
            aria-label={`Shopping cart with ${
              totalItemsCount || 0
            } unique items`}
          >
            <FaShoppingCart size={20} />
            {(totalItemsCount || 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {(totalItemsCount || 0) > 9 ? "9+" : totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Dropdown Area (Animated) */}
      {/* This needs to be positioned correctly relative to the non-fixed header */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            // 'absolute top-full' will position it below the header IF the header itself has 'position: relative'
            // The header is now part of the normal flow, so z-index might need adjustment if it overlaps siblings in CustomerLayout.
            // Giving it a moderate z-index to ensure it's above subsequent sibling content in the main flow if any,
            // but lower than modals.
            className="w-full bg-gray-100 border-b border-gray-300 shadow-md absolute top-full left-0 z-10"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-7xl mx-auto px-4 py-4"
            >
              <label
                htmlFor="site-search-header"
                className="block text-gray-700 text-lg font-semibold mb-3 text-center"
              >
                TÌM KIẾM
              </label>
              <div className="relative">
                <input
                  id="site-search-header"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-12 text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-600 hover:text-amber-500"
                  aria-label="Perform search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
