// src/layouts/CustomerLayout.js
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTimes, // Kept for cart panel
  FaTrash, // Kept for cart items
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShoppingCart as FaShoppingCartIcon, // Alias for cart panel title
} from "react-icons/fa"; // Removed icons now handled by CustomerHeader
import { AnimatePresence, motion } from "framer-motion";

// Import the new Header component
import CustomerHeader from "../components/CustomerHeader"; // Adjust path if needed
import VoucherModal from "../components/VoucherModal";
import { useCart } from "../context/CartContext";
import voucherApiService from "../services/VoucherApiService"; // Ensure this path is correct, e.g., ../services/

export default function CustomerLayout() {
  // Determine if using local state or context state for cart panel
  // For this example, I'm reverting to the local state version you provided,
  // as that's the version you asked to modify.
  // If you want to use the context version for cart panel, you'd destructure
  // isCartPanelOpen, openCartPanel, closeCartPanel from useCart().
  const {
    cartItems,
    totalItemsCount,
    subtotalOfAllItems,
    formatPrice,
    removeItem,
    totalCartItemCount,
    openCartPanel,
  } = useCart();

  // Using local state for cart open/close as per your provided "before" code
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [apiVouchers, setApiVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [voucherError, setVoucherError] = useState(null);

  // Voucher fetching logic (remains the same)
  useEffect(() => {
    const fetchUserVouchers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setApiVouchers([]);
        return;
      }
      setIsLoadingVouchers(true);
      setVoucherError(null);
      try {
        const fetchedVouchersFromApi =
          await voucherApiService.getAvailableVouchers();
        const formattedVouchersForModal = (fetchedVouchersFromApi || []).map(
          (apiVoucher) => ({
            id: apiVoucher.voucherId,
            title: `Giảm ${formatPrice(apiVoucher.discountAmount || 0)}`,
            condition:
              apiVoucher.minOrderAmount != null && apiVoucher.minOrderAmount > 0
                ? `Đơn hàng từ ${formatPrice(apiVoucher.minOrderAmount)}`
                : "Áp dụng cho mọi đơn hàng",
            code: apiVoucher.code,
            expiry: apiVoucher.expiryDate
              ? new Date(apiVoucher.expiryDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Vô thời hạn",
          })
        );
        setApiVouchers(formattedVouchersForModal);
      } catch (error) {
        setVoucherError(error.message || "Could not load vouchers.");
        setApiVouchers([]);
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchUserVouchers();
  }, [location.pathname, formatPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(""); // Clear search term after submit
      setIsSearchOpen(false); // Close search dropdown after submit
    }
  };

  // Effect to close modals on navigation
  useEffect(() => {
    setIsCartOpen(false); // Or closeCartPanel() if using context
    setIsSearchOpen(false);
    setIsVoucherModalOpen(false);
  }, [location]); // location.pathname would be more precise if `location` object changes too often

  const toggleSearch = () => setIsSearchOpen((prev) => !prev); // Use functional update for toggles

  // Voucher Modal handlers
  const openVoucherModalFromLayout = () => setIsVoucherModalOpen(true);
  const closeVoucherModalFromLayout = () => setIsVoucherModalOpen(false);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* --- Use the new CustomerHeader component --- */}
      <CustomerHeader
        isSearchOpen={isSearchOpen}
        toggleSearch={toggleSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchSubmit={handleSearchSubmit}
        totalItemsCount={totalCartItemCount}
        onOpenCart={openCart} // Pass the correct function to open the cart
        // If using context for cart panel, this would be openCartPanel
      />

      {/* --- Cart Overlay & Sliding Panel --- */}
      <AnimatePresence>
        {isCartOpen && ( // Or isCartPanelOpen if using context
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeCart}
            aria-hidden="true"
          /> // Or closeCartPanel
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && ( // Or isCartPanelOpen
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col overflow-hidden"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {" "}
                  <FaShoppingCartIcon size={20} /> Giỏ hàng (
                  {totalCartItemCount})
                </h2>
                <button
                  onClick={closeCart}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close cart"
                >
                  {" "}
                  <FaTimes size={20} />{" "}
                </button>{" "}
                {/* Or closeCartPanel */}
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-10">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                        >
                          <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={
                                item.image || "https://via.placeholder.com/80"
                              }
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-grow flex flex-col justify-between">
                            <div>
                              {" "}
                              <h4 className="font-semibold text-gray-800 text-base mb-1">
                                {item.name}
                              </h4>{" "}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-amber-600 font-bold text-lg flex-shrink-0">
                                {" "}
                                {formatPrice(item.price)}{" "}
                              </div>
                              <div className="flex items-center space-x-3 flex-shrink-0 text-sm text-gray-800">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50/20"
                                  aria-label={`Remove ${item.name} from cart`}
                                >
                                  {" "}
                                  <FaTrash size={16} />{" "}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isLoadingVouchers ? (
                      <p className="text-gray-500 text-center py-2">
                        Đang tải mã ưu đãi...
                      </p>
                    ) : voucherError ? (
                      <p className="text-red-500 text-sm text-center py-2">
                        Lỗi: {voucherError}
                      </p>
                    ) : apiVouchers.length > 0 ? (
                      <div className="pt-4 border-t border-gray-200 text-center">
                        <h3 className="font-semibold text-gray-800 mb-4">
                          MÃ ƯU ĐÃI DÀNH CHO BẠN
                        </h3>
                        <button
                          onClick={openVoucherModalFromLayout}
                          className="text-blue-600 hover:underline font-semibold text-sm"
                        >
                          {" "}
                          Xem tất cả mã ưu đãi ({apiVouchers.length}){" "}
                        </button>
                      </div>
                    ) : (
                      !isLoadingVouchers &&
                      !voucherError && (
                        <p className="text-gray-500 text-center py-2 text-sm">
                          Không có mã ưu đãi nào.
                        </p>
                      )
                    )}
                  </>
                )}
              </div>
              <div className="p-6 border-t border-gray-300 bg-white sticky bottom-0 z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-semibold text-xl text-gray-800">
                    Tạm tính
                  </div>
                  <div className="font-bold text-xl">
                    {formatPrice(subtotalOfAllItems)}
                  </div>
                </div>
                {cartItems.length > 0 && (
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full py-3 rounded transition-colors text-lg font-semibold text-center inline-block bg-black text-white hover:bg-gray-800 shadow-lg"
                  >
                    {" "}
                    Thanh toán{" "}
                  </Link>
                )}
                {cartItems.length > 0 && (
                  <div className="flex justify-center items-center mt-4 text-sm font-semibold">
                    <Link
                      to="/cart"
                      onClick={closeCart}
                      className="text-blue-600 hover:underline"
                    >
                      {" "}
                      Xem giỏ hàng{" "}
                    </Link>{" "}
                    {/* Or closeCartPanel */}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Render the Voucher Modal --- */}
      <AnimatePresence>
        {isVoucherModalOpen && (
          <VoucherModal
            isOpen={isVoucherModalOpen}
            onClose={closeVoucherModalFromLayout}
            vouchers={apiVouchers}
          />
        )}
      </AnimatePresence>

      <main className={`flex-grow ${isSearchOpen ? "pt-[8rem]" : "pt-0"}`}>
        <Outlet />
      </main>

      {/* Footer (remains the same) */}
      <footer className="bg-white pt-12 pb-6 shadow-md border-t border-gray-200">
        {/* ... footer content ... */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              VỀ RETREND.
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              {" "}
              Retrend ra đời đầu năm 2025 với sứ mệnh đưa thời trang bền vững
              đến gần hơn với mọi người. Khởi đầu là một trang chia sẻ câu
              chuyện cuộc sống giản dị, chúng mình đã mở rộng thành nền tảng mua
              bán quần áo second-hand chất lượng cao. Retrend không chỉ là nơi
              mua sắm — đó còn là cộng đồng những người yêu phong cách tối giản,
              sáng tạo và trách nhiệm với môi trường.{" "}
            </p>
            <div className="text-sm text-gray-700 space-y-3">
              <p className="flex items-start">
                {" "}
                <FaMapMarkerAlt className="mr-2 mt-1 text-gray-600 flex-shrink-0" />{" "}
                <span>FPT University, Quận 9, Thành phố Hồ Chí Minh</span>{" "}
              </p>
              <p className="flex items-center">
                {" "}
                <FaPhone className="mr-2 text-gray-600 flex-shrink-0" />{" "}
                0342.1900.17{" "}
              </p>
              <p className="flex items-center">
                {" "}
                <FaEnvelope className="mr-2 text-gray-600 flex-shrink-0" />{" "}
                retrend@gmail.com{" "}
              </p>
            </div>{" "}
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {" "}
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {" "}
                CHÍNH SÁCH MUA HÀNG.{" "}
              </h3>{" "}
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>
                  <Link to="/returns" className="hover:underline">
                    {" "}
                    Chính sách đổi / trả{" "}
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:underline">
                    {" "}
                    Chính sách vận chuyển{" "}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    {" "}
                    Liên hệ{" "}
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    {" "}
                    Hướng dẫn bảo quản / sử dụng{" "}
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:underline">
                    {" "}
                    Danh sách cửa hàng{" "}
                  </Link>
                </li>
              </ul>{" "}
            </div>
            <div>
              {" "}
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {" "}
                Phương thức vận chuyển{" "}
              </h3>{" "}
              <p className="text-sm text-gray-700 space-y-2">
                {" "}
                <span>Giao hàng tiêu chuẩn (2-5 ngày)</span>{" "}
                <span>Giao hàng hỏa tốc (Nội thành)</span>{" "}
              </p>{" "}
            </div>
          </div>{" "}
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          {" "}
          Copyright © 2025 THE RETREND.{" "}
        </div>
      </footer>
    </div>
  );
}
