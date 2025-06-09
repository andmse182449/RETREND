import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShoppingCart as FaShoppingCartIcon,
  FaSpinner,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import CustomerHeader from "../components/CustomerHeader";
import VoucherModal from "../components/VoucherModal";
import { useCart } from "../context/CartContext";
import voucherApiService from "../services/VoucherApiService";

export default function CustomerLayout() {
  const {
    cartItems,
    subtotalOfAllItems,
    formatPrice,
    removeItem,
    totalCartItemCount,
    isCartPanelOpen,
    openCartPanel,
    closeCartPanel,
  } = useCart();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [apiVouchers, setApiVouchers] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [voucherError, setVoucherError] = useState(null);
  const [isRemovingItem, setIsRemovingItem] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const HEADER_OFFSET_CLASS = "pt-16";

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
  }, [formatPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    closeCartPanel();
    setIsSearchOpen(false);
    setIsVoucherModalOpen(false);
  }, [location, closeCartPanel]);

  const toggleSearch = () => setIsSearchOpen((prev) => !prev);
  const openVoucherModalFromLayout = () => setIsVoucherModalOpen(true);
  const closeVoucherModalFromLayout = () => setIsVoucherModalOpen(false);

  const handleRemoveItemFromPanel = async (item) => {
    if (!item || typeof item.id === "undefined") {
      toast.error("Sản phẩm không hợp lệ để xóa.");
      return;
    }

    setIsRemovingItem(item.id);
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error(
        "CustomerLayout: Error from removeItem context action:",
        error
      );
      toast.error(error.message || "Lỗi khi xóa sản phẩm khỏi giỏ.");
    } finally {
      setIsRemovingItem(null);
    }
  };

  return (
    <div
      className={`w-full min-h-screen flex flex-col bg-gray-50 text-gray-800`}
    >
      <CustomerHeader
        isSearchOpen={isSearchOpen}
        toggleSearch={toggleSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchSubmit={handleSearchSubmit}
        totalItemsCount={totalCartItemCount}
        onOpenCart={openCartPanel}
      />

      <AnimatePresence>
        {isCartPanelOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={closeCartPanel}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartPanelOpen && (
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className={`h-full flex flex-col`}>
              <div className="p-5 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2.5">
                  <FaShoppingCartIcon size={20} className="text-gray-700" /> Giỏ
                  hàng ({totalCartItemCount})
                </h2>
                <button
                  onClick={closeCartPanel}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close cart"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 space-y-5 no-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
                    <FaShoppingCartIcon size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      Giỏ hàng của bạn đang trống
                    </p>
                    <p className="text-sm mt-1">
                      Hãy thêm sản phẩm vào giỏ nhé!
                    </p>
                    <button
                      onClick={() => {
                        navigate("/products");
                        closeCartPanel();
                      }}
                      className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                        >
                          <Link
                            to={`/products/${item.id}`}
                            onClick={closeCartPanel}
                            className="shrink-0"
                          >
                            <img
                              src={
                                item.image ||
                                "https://via.placeholder.com/80x80?text=No+Img"
                              }
                              alt={item.name || "Product Image"}
                              className="w-20 h-20 object-cover rounded-md border border-gray-200"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/products/${item.id}`}
                              onClick={closeCartPanel}
                              className="hover:text-blue-600 transition-colors"
                            >
                              <h4 className="font-semibold text-gray-800 text-sm leading-tight truncate pr-8">
                                {item.name || "Sản phẩm không tên"}
                              </h4>
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Số lượng: {item.quantity || 1}
                            </p>
                          </div>
                          <div className="flex flex-col items-end justify-between h-full shrink-0 ml-2">
                            <p className="text-amber-600 font-bold text-sm md:text-base">
                              {formatPrice(item.price)}
                            </p>
                            <button
                              onClick={() => handleRemoveItemFromPanel(item)}
                              disabled={isRemovingItem === item.id}
                              className="text-gray-400 hover:text-red-500 transition-colors text-xs flex items-center mt-auto disabled:opacity-50"
                              aria-label={`Remove ${
                                item.name || "item"
                              } from cart`}
                            >
                              {isRemovingItem === item.id ? (
                                <FaSpinner className="animate-spin w-3.5 h-3.5" />
                              ) : (
                                <FaTrash size={12} className="mr-1" />
                              )}
                              {isRemovingItem !== item.id && "Xóa"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {isLoadingVouchers ? (
                      <p className="text-center text-xs text-gray-400 py-2">
                        Đang tải ưu đãi...
                      </p>
                    ) : voucherError ? (
                      <p className="text-center text-xs text-red-400 py-2">
                        Lỗi tải ưu đãi: {voucherError}
                      </p>
                    ) : apiVouchers.length > 0 ? (
                      <div className="pt-4 border-t border-gray-200 text-center">
                        <h3 className="font-medium text-gray-700 text-sm mb-2">
                          ƯU ĐÃI CHO BẠN
                        </h3>
                        <button
                          onClick={openVoucherModalFromLayout}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline"
                        >
                          Xem tất cả ({apiVouchers.length})
                        </button>
                      </div>
                    ) : (
                      !isLoadingVouchers &&
                      !voucherError && (
                        <p className="text-center text-xs text-gray-400 py-2">
                          Không có ưu đãi nào.
                        </p>
                      )
                    )}
                  </>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 md:p-6 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">
                      Tạm tính:
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(subtotalOfAllItems)}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={closeCartPanel}
                    className="w-full py-3 px-4 rounded-lg transition-colors text-base font-semibold text-center inline-block bg-gray-800 text-white hover:bg-gray-700 shadow-md"
                  >
                    Thanh toán
                  </Link>
                  <div className="text-center mt-3">
                    <Link
                      to="/cart"
                      onClick={closeCartPanel}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Xem chi tiết giỏ hàng
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVoucherModalOpen && (
          <VoucherModal
            isOpen={isVoucherModalOpen}
            onClose={closeVoucherModalFromLayout}
            vouchers={apiVouchers}
          />
        )}
      </AnimatePresence>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <footer className="bg-white pt-12 pb-6 shadow-md border-t-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              VỀ RETREND.
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Retrend - Nền tảng mua bán thời trang secondhand uy tín. Khám phá
              phong cách bền vững, độc đáo và tiết kiệm.
            </p>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p className="flex items-start">
                <FaMapMarkerAlt className="mr-2 mt-0.5 text-gray-500 flex-shrink-0 w-3.5 h-3.5" />
                <span>
                  Lô E2a-7, Đường D1, Khu Công nghệ cao, Long Thạnh Mỹ, Tp. Thủ
                  Đức, TP.HCM
                </span>
              </p>
              <p className="flex items-center">
                <FaPhone className="mr-2 text-gray-500 flex-shrink-0 w-3.5 h-3.5" />
                0123.456.789
              </p>
              <p className="flex items-center">
                <FaEnvelope className="mr-2 text-gray-500 flex-shrink-0 w-3.5 h-3.5" />
                support@retrend.vn
              </p>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                CHÍNH SÁCH
              </h3>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>
                  <Link
                    to="/returns"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Đổi / Trả
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Vận chuyển
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Bảo mật
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Điều khoản
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                HỖ TRỢ
              </h3>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-to-sell"
                    className="hover:text-blue-600 hover:underline"
                  >
                    Hướng dẫn bán hàng
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
                KẾT NỐI
              </h3>{" "}
              <p className="text-xs text-gray-600">Facebook, Instagram</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-500">
          Copyright © {new Date().getFullYear()} THE RETREND. All rights
          reserved.
        </div>
      </footer>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
